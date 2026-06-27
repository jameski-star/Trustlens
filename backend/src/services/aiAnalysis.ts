import { logger } from '../utils/logger';

interface AIAnalysisResult {
  summary: string;
  riskFactors: string[];
  confidence: number;
  modelVersion: string;
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
  try {
    const mistralApiKey = process.env.MISTRAL_API_KEY || '';
    if (mistralApiKey) {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: 'open-mistral-nemo',
          messages: [
            { role: 'system', content: 'You are a cybersecurity analysis AI. Analyze the following content for scam/fraud indicators. Provide a brief, factual analysis in 1-3 sentences.' },
            { role: 'user', content: `Analyze this ${type} for security risks: ${input.substring(0, 2000)}` },
          ],
          max_tokens: 200,
        }),
      });
      if (response.ok) {
        const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        aiSummary = data.choices?.[0]?.message?.content || '';
      }
    }
  } catch {
    logger.warn('Mistral AI analysis unavailable, using rule-based analysis');
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
