import { config } from '../config';

export interface AnalysisContext {
  siteTitle?: string;
  siteDescription?: string;
  hasForms?: boolean;
  hasPasswordField?: boolean;
  hasPrivacyPolicy?: boolean;
  hasContactPage?: boolean;
  contentLength?: number;
  siteRisks?: string[];
  domainAgeDays?: number;
  whoisCountry?: string;
  whoisOrg?: string;
  blacklistedSources?: string[];
  communityReports?: { malicious: number; safe: number; count: number };
  detectedRisks?: string[];
  scamTemplates?: string[];
}

interface AIAnalysisResult {
  summary: string;
  riskFactors: string[];
  confidence: number;
  modelVersion: string;
}

const PHISHING_INDICATORS = [
  'urgent', 'click here', 'verify your account', 'login now', 'update your information',
  'suspended', 'limited', 'unusual activity', 'security alert', 'confirm your identity',
  'payment required', 'account blocked', 'verify now', 'action required',
];

const SPAM_INDICATORS = [
  'congratulations', 'you won', 'free prize', 'lottery', 'inheritance',
  'million dollars', 'wire transfer', 'western union', 'money gram',
  'prince', 'investment opportunity', 'guaranteed returns',
];

function extractRiskFactors(input: string): string[] {
  const factors: string[] = [];
  const lower = input.toLowerCase();

  for (const indicator of PHISHING_INDICATORS) {
    if (lower.includes(indicator)) {
      factors.push(`Contains phishing language: "${indicator}"`);
    }
  }

  for (const indicator of SPAM_INDICATORS) {
    if (lower.includes(indicator)) {
      factors.push(`Contains spam indicators: "${indicator}"`);
    }
  }

  if (lower.includes('http://') && !lower.includes('https://')) {
    factors.push('Contains non-HTTPS links which are insecure');
  }

  if ((input.match(/[A-Z]{4,}/g) || []).length > 2) {
    factors.push('Excessive use of capital letters, common in scam messages');
  }

  if ((input.match(/!/g) || []).length > 3) {
    factors.push('Excessive exclamation marks, typical of urgent scam messages');
  }

  if ((input.match(/https?:\/\//g) || []).length > 2) {
    factors.push('Multiple URLs in single message, unusual for legitimate communications');
  }

  return factors;
}

async function callAIProvider(config: { apiKey: string; url: string; model: string; timeoutMs: number; maxTokens: number }, type: string, input: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a cybersecurity analysis AI. Analyze the following content for scam/fraud indicators. Provide a brief, factual analysis in 1-3 sentences.' },
          { role: 'user', content: `Analyze this ${type} for security risks: ${input.substring(0, 2000)}` },
        ],
        max_tokens: config.maxTokens,
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

async function callGemini(type: string, input: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.gemini.timeoutMs);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Analyze this ${type} for security risks and scam/fraud indicators: ${input.substring(0, 2000)}` }] }],
          systemInstruction: { parts: [{ text: 'You are a cybersecurity analysis AI. Provide a brief, factual analysis in 1-3 sentences.' }] },
          generationConfig: { maxOutputTokens: config.gemini.maxTokens },
        }),
        signal: controller.signal,
      },
    );
    if (response.ok) {
      const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${body.substring(0, 200)}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

type AIProvider = () => Promise<string>;

function createOpenAIProvider(type: string, input: string): AIProvider | null {
  if (!config.mistral.apiKey) return null;
  return () => callAIProvider(
    {
      apiKey: config.mistral.apiKey,
      url: 'https://api.mistral.ai/v1/chat/completions',
      model: config.mistral.model,
      timeoutMs: config.mistral.timeoutMs,
      maxTokens: config.mistral.maxTokens,
    },
    type, input,
  );
}

function createNvidiaProvider(type: string, input: string): AIProvider | null {
  if (!config.nvidia.apiKey) return null;
  return () => callAIProvider(
    {
      apiKey: config.nvidia.apiKey,
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      model: config.nvidia.model,
      timeoutMs: config.nvidia.timeoutMs,
      maxTokens: config.nvidia.maxTokens,
    },
    type, input,
  );
}

function createGeminiProvider(type: string, input: string): AIProvider | null {
  if (!config.gemini.apiKey) return null;
  return () => callGemini(type, input);
}

async function raceAIProviders(providers: AIProvider[], signal?: AbortSignal): Promise<string> {
  if (providers.length === 0) return '';
  if (providers.length === 1) {
    try {
      return await providers[0]();
    } catch { return ''; }
  }

  const errors: unknown[] = [];

  const raced = providers.map((p) =>
    p().then((r) => {
      if (signal?.aborted) return '';
      return r;
    }).catch((err) => {
      errors.push(err);
      throw err;
    })
  );

  const result = await Promise.race(raced).catch(() => '');
  if (result) return result;

  return '';
}

export async function performAIAnalysis(input: string, type: string, context?: AnalysisContext): Promise<AIAnalysisResult> {
  const riskFactors = extractRiskFactors(input);
  let confidence = 75;

  const providers: AIProvider[] = [
    createOpenAIProvider(type, input),
    createNvidiaProvider(type, input),
    createGeminiProvider(type, input),
  ].filter(Boolean) as AIProvider[];

  let aiSummary = '';

  if (providers.length > 0) {
    aiSummary = await raceAIProviders(providers);
  }

  const summary = aiSummary || generateRuleBasedSummary(riskFactors, type, context);

  confidence = Math.max(50, Math.min(98, confidence - riskFactors.length * 3));

  return {
    summary,
    riskFactors: riskFactors.slice(0, 5),
    confidence,
    modelVersion: 'trustlens-ai-v1.0',
  };
}

function generateRuleBasedSummary(riskFactors: string[], type: string, context?: AnalysisContext): string {
  if (!context) {
    if (riskFactors.length === 0) return `No scam indicators detected in this ${type}. Exercise normal caution.`;
    return `${riskFactors.length} risk indicator${riskFactors.length > 1 ? 's' : ''} found in this ${type}. Proceed with caution.`;
  }

  const parts: string[] = [];

  if (type === 'url' || type === 'qrcode') {
    if (context.siteTitle) parts.push(`Site titled "${context.siteTitle.substring(0, 60)}"`);
    if (context.domainAgeDays !== undefined) {
      if (context.domainAgeDays < 30) parts.push(`registered only ${context.domainAgeDays} days ago`);
      else if (context.domainAgeDays < 365) parts.push(`registered ${Math.floor(context.domainAgeDays / 30)} months ago`);
      else parts.push(`registered ${Math.floor(context.domainAgeDays / 365)} years ago`);
    }
    if (context.whoisCountry && context.whoisCountry !== 'Unknown') parts.push(`in ${context.whoisCountry}`);
    if (context.whoisOrg && context.whoisOrg !== 'Unknown') parts.push(`(${context.whoisOrg.substring(0, 40)})`);
    if (context.hasPasswordField) parts.push('contains a password field — possible credential harvesting');
    if (!context.hasPrivacyPolicy && context.contentLength && context.contentLength > 0) parts.push('has no privacy policy — reduces accountability');
    if (!context.hasContactPage && context.contentLength && context.contentLength > 0) parts.push('has no contact page');
    if (context.blacklistedSources && context.blacklistedSources.length > 0) parts.push(`blacklisted on ${context.blacklistedSources.length} source${context.blacklistedSources.length > 1 ? 's' : ''}`);
    if (context.siteRisks && context.siteRisks.length > 0) parts.push(context.siteRisks.slice(0, 2).join('; '));
  }

  if (type === 'email') {
    if (context.scamTemplates && context.scamTemplates.length > 0) parts.push(`Matches ${context.scamTemplates[0]}`);
    if (context.detectedRisks && context.detectedRisks.length > 0) parts.push(context.detectedRisks.slice(0, 2).join('; '));
    if (riskFactors.some(r => r.includes('Contains phishing language'))) parts.push('phishing language detected in message body');
  }

  if (type === 'sms') {
    if (context.scamTemplates && context.scamTemplates.length > 0) parts.push(`Matches known scam template: "${context.scamTemplates[0]}"`);
    const phishCount = riskFactors.filter(r => r.includes('Contains phishing language')).length;
    if (phishCount > 0) parts.push(`${phishCount} phishing trigger${phishCount > 1 ? 's' : ''} detected`);
    if (riskFactors.some(r => r.includes('Excessive exclamation'))) parts.push('uses urgency language with excessive punctuation');
  }

  if (type === 'phone') {
    if (context.detectedRisks && context.detectedRisks.length > 0) parts.push(context.detectedRisks[0]);
    if (riskFactors.some(r => r.includes('High-Risk Region'))) parts.push('originates from a region associated with scam operations');
  }

  if (context.communityReports && context.communityReports.count > 0) {
    const { malicious, safe, count } = context.communityReports;
    if (malicious > safe) parts.push(`reported malicious by ${malicious}/${count} community members`);
  }

  if (parts.length > 0) return parts.join('. ').replace(/\.\./g, '.') + '.';

  if (riskFactors.length === 0) return `No scam indicators detected in this ${type}. Exercise normal caution.`;
  return `${riskFactors.length} risk indicator${riskFactors.length > 1 ? 's' : ''} found in this ${type}. ${riskFactors[0]}.`;
}
