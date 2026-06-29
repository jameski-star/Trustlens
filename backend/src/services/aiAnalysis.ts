import { logger } from '../utils/logger';
import { config } from '../config';

interface AIAnalysisResult {
  summary: string;
  riskFactors: string[];
  confidence: number;
  modelVersion: string;
}

let lastMistralCall = 0;
let mistralCallInProgress = false;
let mistralRateLimited = false;
let mistralRateLimitReset = 0;
let mistralConsecutive429s = 0;
let last429LogTime = 0;

let nvidiaDisabled = false;
let lastNvidiaLogTime = 0;

async function throttleMistral(): Promise<void> {
  if (mistralRateLimited) {
    if (Date.now() < mistralRateLimitReset) {
      throw new Error('rate_limited');
    }
    mistralRateLimited = false;
    mistralConsecutive429s = 0;
  }

  const elapsed = Date.now() - lastMistralCall;
  if (elapsed < config.mistral.rateLimitIntervalMs || mistralCallInProgress) {
    throw new Error('rate_limited');
  }

  mistralCallInProgress = true;
}

async function callAIProvider(
  apiKey: string,
  url: string,
  model: string,
  type: string,
  input: string,
  timeoutMs: number,
  maxTokens: number,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a cybersecurity analysis AI. Analyze the following content for scam/fraud indicators. Provide a brief, factual analysis in 1-3 sentences.' },
          { role: 'user', content: `Analyze this ${type} for security risks: ${input.substring(0, 2000)}` },
        ],
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
    if (response.ok) {
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content || '';
    }
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${body.substring(0, 200)}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callMistral(type: string, input: string): Promise<string> {
  await throttleMistral();
  try {
    const summary = await callAIProvider(
      config.mistral.apiKey,
      'https://api.mistral.ai/v1/chat/completions',
      config.mistral.model,
      type, input,
      config.mistral.timeoutMs,
      config.mistral.maxTokens,
    );
    mistralRateLimited = false;
    mistralConsecutive429s = 0;
    return summary;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith('HTTP 429')) {
      mistralConsecutive429s++;
      const backoff = Math.min(60 * Math.pow(2, mistralConsecutive429s - 1), 600);
      mistralRateLimited = true;
      mistralRateLimitReset = Date.now() + backoff * 1000;
      const now = Date.now();
      if (now - last429LogTime > 60000) {
        logger.warn('Mistral AI rate limited (429), backing off %ds (consecutive: %d)', backoff, mistralConsecutive429s);
        last429LogTime = now;
      } else {
        logger.debug('Mistral AI rate limited (429), backing off %ds (consecutive: %d)', backoff, mistralConsecutive429s);
      }
    } else if (message.startsWith('HTTP 401')) {
      logger.warn('Mistral AI API key is invalid or unauthorized');
    } else {
      logger.debug('Mistral AI unavailable: %s', message);
    }
    throw err;
  } finally {
    lastMistralCall = Date.now();
    mistralCallInProgress = false;
  }
}

async function callNvidia(type: string, input: string): Promise<string> {
  if (nvidiaDisabled) {
    throw new Error('nvidia_disabled');
  }

  try {
    return await callAIProvider(
      config.nvidia.apiKey,
      'https://integrate.api.nvidia.com/v1/chat/completions',
      config.nvidia.model,
      type, input,
      config.nvidia.timeoutMs,
      config.nvidia.maxTokens,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    nvidiaDisabled = true;
    const now = Date.now();
    if (now - lastNvidiaLogTime > 60000) {
      logger.warn('NVIDIA AI unavailable (%s) — disabling fallback', message);
      lastNvidiaLogTime = now;
    }
    throw err;
  }
}

export async function performAIAnalysis(input: string, type: string): Promise<AIAnalysisResult> {
  const riskFactors: string[] = [];
  let confidence = 75;

  const inputLower = input.toLowerCase();

  const phishingIndicators = [
    'urgent', 'click here', 'verify your account', 'login now', 'update your information',
    'suspended', 'limited', 'unusual activity', 'security alert', 'confirm your identity',
    'payment required', 'account blocked', 'verify now', 'action required',
  ];

  const spamIndicators = [
    'congratulations', 'you won', 'free prize', 'lottery', 'inheritance',
    'million dollars', 'wire transfer', 'western union', 'money gram',
    'prince', 'investment opportunity', 'guaranteed returns',
  ];

  for (const indicator of phishingIndicators) {
    if (inputLower.includes(indicator)) {
      riskFactors.push(`Contains phishing language: "${indicator}"`);
    }
  }

  for (const indicator of spamIndicators) {
    if (inputLower.includes(indicator)) {
      riskFactors.push(`Contains spam indicators: "${indicator}"`);
    }
  }

  if (inputLower.includes('http://') && !inputLower.includes('https://')) {
    riskFactors.push('Contains non-HTTPS links which are insecure');
  }

  const excessiveCaps = (input.match(/[A-Z]{4,}/g) || []).length;
  if (excessiveCaps > 2) {
    riskFactors.push('Excessive use of capital letters, common in scam messages');
  }

  const exclamationCount = (input.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    riskFactors.push('Excessive exclamation marks, typical of urgent scam messages');
  }

  const urlCount = (input.match(/https?:\/\//g) || []).length;
  if (urlCount > 2) {
    riskFactors.push('Multiple URLs in single message, unusual for legitimate communications');
  }

  let aiSummary = '';

  if (config.mistral.apiKey) {
    try {
      aiSummary = await callMistral(type, input);
    } catch {
      // Mistral failed — try fallback
    }
  }

  if (!aiSummary && config.nvidia.apiKey) {
    try {
      aiSummary = await callNvidia(type, input);
    } catch {
      // Both failed — fall back to rule-based
    }
  }

  const summary = aiSummary || generateRuleBasedSummary(riskFactors, type);
  
  confidence = Math.max(50, Math.min(98, confidence - riskFactors.length * 3));

  return {
    summary,
    riskFactors: riskFactors.slice(0, 5),
    confidence,
    modelVersion: 'trustlens-ai-v1.0',
  };
}

function generateRuleBasedSummary(riskFactors: string[], type: string): string {
  if (riskFactors.length === 0) {
    return `Our analysis did not detect common ${type} scam indicators. However, always exercise caution with unsolicited communications.`;
  }
  return `Our AI analysis detected ${riskFactors.length} potential risk indicator${riskFactors.length > 1 ? 's' : ''} in this ${type}. This does not guarantee malicious intent, but we recommend proceeding with caution.`;
}
