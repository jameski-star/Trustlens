import Tesseract from 'tesseract.js';
import { analyzeUrl, analyzeEmail, analyzePhoneNumber, analyzeSmsContent } from './scanner';
import { performAIAnalysis } from './aiAnalysis';
import { detectScamTemplates, isKnownScamDomain } from './scamPatterns';

const URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  return matches ? [...new Set(matches.map(u => u.replace(/[^a-zA-Z0-9:/._~#?&=+%-]/g, '')))] : [];
}

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX);
  return matches ? [...new Set(matches)] : [];
}

function extractPhones(text: string): string[] {
  const matches = text.match(PHONE_REGEX);
  if (!matches) return [];
  const cleaned = matches.map(p => p.replace(/[-.\s()]/g, '')).filter(p => p.length >= 7);
  return [...new Set(cleaned)];
}

function detectWhatsAppIndicators(text: string): string[] {
  const indicators: string[] = [];
  const lower = text.toLowerCase();
  if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(lower)) indicators.push('Contains date-stamped messages (chat log format)');
  if (/whatsapp|telegram|signal/i.test(lower)) indicators.push('Mentions messaging platform');
  if (/(?:sent|received|delivered|read|typing)/i.test(lower)) indicators.push('Contains messaging status indicators');
  if (/(?:hey|hi|hello|dear|bro|sis|dear customer)/i.test(lower)) indicators.push('Contains conversational greetings');
  return indicators;
}

export interface ScreenshotExtractedContent {
  fullText: string;
  urls: string[];
  emails: string[];
  phones: string[];
  scamPatterns: { matched: string; label: string }[];
  whatsAppIndicators: string[];
}

export interface ScreenshotAnalysisResult {
  extracted: ScreenshotExtractedContent;
  urlResults: Array<{ url: string; riskScore: number; summary: string; risks: string[] }>;
  emailResults: Array<{ email: string; riskScore: number; summary: string; risks: string[] }>;
  phoneResults: Array<{ phone: string; riskScore: number; summary: string; risks: string[] }>;
  aiSummary: string;
  overallRisk: number;
  detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }>;
}

export async function analyzeScreenshot(base64Data: string): Promise<ScreenshotAnalysisResult> {
  const detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = [];
  let overallRisk = 50;

  const imageBuffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const ocrResult = await Tesseract.recognize(imageBuffer, 'eng', { logger: () => void 0 });
  const fullText = ocrResult.data.text.trim();

  if (!fullText) {
    return {
      extracted: { fullText: '', urls: [], emails: [], phones: [], scamPatterns: [], whatsAppIndicators: [] },
      urlResults: [], emailResults: [], phoneResults: [],
      aiSummary: 'No readable text could be extracted from this image.',
      overallRisk: 50,
      detectedRisks: [{ category: 'OCR', severity: 'low', description: 'No readable text found in the image.' }],
    };
  }

  if (fullText.length < 10) {
    detectedRisks.push({ category: 'OCR', severity: 'low', description: 'Very little text detected — image may not contain useful content.' });
  }

  const urls = extractUrls(fullText);
  const emails = extractEmails(fullText);
  const phones = extractPhones(fullText);
  const scamPatterns = detectScamTemplates(fullText);
  const whatsAppIndicators = detectWhatsAppIndicators(fullText);

  if (whatsAppIndicators.length > 0) {
    detectedRisks.push({ category: 'Chat Analysis', severity: 'medium', description: 'This appears to be a chat/messaging screenshot.' });
  }

  const urlResults = await Promise.allSettled(
    urls.slice(0, 5).map(async (url) => {
      try {
        const result = await analyzeUrl(url);
        return {
          url,
          riskScore: result.riskScore,
          summary: result.summary,
          risks: result.detectedRisks.map(r => r.description),
        };
      } catch {
        return { url, riskScore: 50, summary: 'Could not analyze URL.', risks: [] };
      }
    })
  );

  const emailResults = await Promise.allSettled(
    emails.slice(0, 5).map(async (email) => {
      try {
        const domain = email.split('@')[1];
        const result = analyzeEmail(email);
        const isScamDomain = domain && isKnownScamDomain(domain);
        const risks = result.detectedRisks.map(r => r.description);
        if (isScamDomain) risks.push(`Email domain "${domain}" is associated with known scams.`);
        return {
          email,
          riskScore: isScamDomain ? Math.min(result.riskScore, 15) : result.riskScore,
          summary: result.summary,
          risks,
        };
      } catch {
        return { email, riskScore: 50, summary: 'Could not analyze email.', risks: [] };
      }
    })
  );

  const phoneResults = await Promise.allSettled(
    phones.slice(0, 5).map(async (phone) => {
      try {
        const prefix = phone.replace(/[^+\d]/g, '').substring(0, 4);
        const isHighRisk = isHighRiskPhone(prefix);
        const result = analyzePhoneNumber(phone);
        const risks = result.detectedRisks.map(r => r.description);
        if (isHighRisk) risks.push(`Phone prefix ${prefix} is associated with high-risk regions.`);
        return {
          phone,
          riskScore: isHighRisk ? 15 : result.riskScore,
          summary: result.summary,
          risks,
        };
      } catch {
        return { phone, riskScore: 50, summary: 'Could not analyze phone number.', risks: [] };
      }
    })
  );

  const aiResult = await performAIAnalysis(fullText, 'screenshot');

  const resolvedUrls = urlResults
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  const resolvedEmails = emailResults
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  const resolvedPhones = phoneResults
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  for (const url of resolvedUrls) {
    if (url.riskScore <= 40) {
      overallRisk = Math.min(overallRisk + 15, 100);
      detectedRisks.push({ category: 'URL Found', severity: url.riskScore <= 20 ? 'high' : 'medium', description: `Suspicious URL in screenshot: ${url.url.substring(0, 60)}` });
    }
  }

  for (const email of resolvedEmails) {
    if (email.riskScore <= 40) {
      overallRisk = Math.min(overallRisk + 10, 100);
      detectedRisks.push({ category: 'Email Found', severity: email.riskScore <= 20 ? 'high' : 'medium', description: `Suspicious email in screenshot: ${email.email.substring(0, 40)}` });
    }
  }

  for (const phone of resolvedPhones) {
    if (phone.riskScore <= 40) {
      overallRisk = Math.min(overallRisk + 10, 100);
      detectedRisks.push({ category: 'Phone Found', severity: phone.riskScore <= 20 ? 'high' : 'medium', description: `Suspicious phone number in screenshot: ${phone.phone.substring(0, 20)}` });
    }
  }

  if (scamPatterns.length > 0) {
    for (const sp of scamPatterns) {
      overallRisk = Math.min(overallRisk + 8, 100);
      detectedRisks.push({ category: 'Scam Pattern', severity: 'high', description: `Matched known scam template: "${sp.label}"` });
    }
  }

  if (detectedRisks.length === 0) {
    overallRisk = 80;
  }

  overallRisk = Math.max(0, Math.min(100, overallRisk));

  return {
    extracted: { fullText, urls, emails, phones, scamPatterns, whatsAppIndicators },
    urlResults: resolvedUrls,
    emailResults: resolvedEmails,
    phoneResults: resolvedPhones,
    aiSummary: aiResult.summary,
    overallRisk,
    detectedRisks,
  };
}

function isHighRiskPhone(prefix: string): boolean {
  return ['+234', '+233', '+92', '+880', '+63', '+91', '+256', '+84', '+95', '+20',
    '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', '+224',
    '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+235',
    '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244',
    '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253',
    '+254', '+255', '+256', '+257', '+258', '+259', '+260', '+261', '+262',
    '+263', '+264', '+265', '+266', '+267', '+268', '+269'].some(p => prefix.startsWith(p));
}
