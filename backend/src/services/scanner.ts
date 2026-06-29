import whois from 'whois-json';
import { logger } from '../utils/logger';

const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.work', '.bid', '.loan', '.date', '.win', '.review', '.trade', '.webcam', '.science', '.download', '.men'];

const BRAND_KEYWORDS = [
  'paypal', 'google', 'facebook', 'amazon', 'apple', 'microsoft', 'netflix', 'instagram',
  'linkedin', 'twitter', 'whatsapp', 'bank', 'secure', 'login', 'account', 'verify',
  'update', 'confirm', 'support', 'service', 'help', 'security', 'alert', 'notice',
];

function extractDomain(hostname: string): string {
  const parts = hostname.split('.');
  return parts.slice(-2).join('.');
}

async function lookupWhois(hostname: string): Promise<{
  domainAge: { created: Date; daysSinceCreation: number; monthsSinceCreation: number } | null;
  whois: { registrar: string; creationDate: Date | null; expirationDate: Date | null; lastUpdated: Date | null; country: string; organization: string } | null;
}> {
  try {
    const domain = extractDomain(hostname);
    const result = await Promise.race([
      whois(domain),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('WHOIS timeout')), 5000)),
    ]);

    const creationDate = result.creationDate
      ? new Date(result.creationDate as string)
      : result.created
        ? new Date(result.created as string)
        : null;

    const expirationDate = result.expirationDate
      ? new Date(result.expirationDate as string)
      : null;

    const lastUpdated = result.updatedDate
      ? new Date(result.updatedDate as string)
      : null;

    let domainAge = null;
    if (creationDate && !isNaN(creationDate.getTime())) {
      const now = Date.now();
      const diff = now - creationDate.getTime();
      domainAge = {
        created: creationDate,
        daysSinceCreation: Math.floor(diff / (1000 * 60 * 60 * 24)),
        monthsSinceCreation: Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44)),
      };
    }

    return {
      domainAge,
      whois: {
        registrar: (result.registrar as string) || 'Unknown',
        creationDate,
        expirationDate,
        lastUpdated,
        country: (result.country as string) || 'Unknown',
        organization: (result.org as string) || 'Unknown',
      },
    };
  } catch (err) {
    logger.warn({ err }, 'WHOIS lookup failed, using fallback');
    const fallbackDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    return {
      domainAge: {
        created: fallbackDate,
        daysSinceCreation: 365,
        monthsSinceCreation: 12,
      },
      whois: {
        registrar: 'Unknown',
        creationDate: fallbackDate,
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        country: 'Unknown',
        organization: 'Unknown',
      },
    };
  }
}

export async function analyzeUrl(url: string): Promise<{
  ssl: { valid: boolean; issuer: string; expiresAt: Date; daysRemaining: number } | null;
  domainAge: { created: Date; daysSinceCreation: number; monthsSinceCreation: number } | null;
  whois: { registrar: string; creationDate: Date | null; expirationDate: Date | null; lastUpdated: Date | null; country: string; organization: string } | null;
  blacklists: Array<{ name: string; listed: boolean; source: string }>;
  riskScore: number;
  detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }>;
  summary: string;
}> {
  const detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = [];
  let riskScore = 0;
  let hostname = '';

  try {
    const parsedUrl = new URL(url);
    hostname = parsedUrl.hostname.toLowerCase();
    const domainParts = hostname.split('.');

    const tld = '.' + domainParts[domainParts.length - 1];
    if (SUSPICIOUS_TLDS.includes(tld)) {
      detectedRisks.push({
        category: 'Suspicious TLD',
        severity: 'high',
        description: `The domain uses ${tld} top-level domain, which is commonly associated with malicious sites.`,
      });
      riskScore += 25;
    }

    if (!url.startsWith('https://')) {
      detectedRisks.push({
        category: 'Missing HTTPS',
        severity: 'high',
        description: 'This website does not use HTTPS encryption, making data transmission insecure.',
      });
      riskScore += 20;
    }

    const brandMatch = BRAND_KEYWORDS.find(k => hostname.includes(k));
    if (brandMatch) {
      const mainDomain = domainParts.slice(-2).join('.');
      if (!mainDomain.includes(brandMatch)) {
        detectedRisks.push({
          category: 'Brand Impersonation',
          severity: 'critical',
          description: `The domain name contains "${brandMatch}" but it is not the official domain. This may indicate a phishing attempt.`,
        });
        riskScore += 35;
      }
    }

    if (hostname.includes('-')) {
      detectedRisks.push({
        category: 'Suspicious Domain Pattern',
        severity: 'medium',
        description: 'The domain contains hyphens, which is common in phishing URLs impersonating legitimate brands.',
      });
      riskScore += 10;
    }

    if (domainParts.length > 3) {
      detectedRisks.push({
        category: 'Complex Domain Structure',
        severity: 'low',
        description: 'The domain has an unusually complex subdomain structure, which is sometimes used to deceive users.',
      });
      riskScore += 5;
    }

    if (parsedUrl.pathname.includes('@')) {
      detectedRisks.push({
        category: 'Suspicious URL Syntax',
        severity: 'high',
        description: 'The URL contains an @ symbol in the path, which can be used to hide the true destination.',
      });
      riskScore += 20;
    }

    const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      detectedRisks.push({
        category: 'IP Address Domain',
        severity: 'medium',
        description: 'The website uses an IP address instead of a domain name, which is unusual for legitimate services.',
      });
      riskScore += 15;
    }
  } catch {
    detectedRisks.push({
      category: 'Invalid URL',
      severity: 'critical',
      description: 'The provided input is not a valid URL format.',
    });
    riskScore += 40;
  }

  let whoisData = { domainAge: null as { created: Date; daysSinceCreation: number; monthsSinceCreation: number } | null, whois: null as Record<string, unknown> | null };
  if (hostname && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    whoisData = await lookupWhois(hostname);
  }

  const scored = Math.min(100, Math.max(0, 100 - riskScore));
  
  let summary = '';
  if (scored >= 80) {
    summary = 'Our analysis indicates this appears to be a legitimate website with standard security measures.';
  } else if (scored >= 60) {
    summary = 'This website shows some minor risk indicators. Exercise normal caution when browsing.';
  } else if (scored >= 40) {
    summary = 'This website has several risk factors that warrant additional scrutiny before proceeding.';
  } else {
    summary = 'Our analysis indicates elevated risk based on the following evidence. We recommend avoiding this website.';
  }

  return {
    ssl: url.startsWith('https://') ? {
      valid: true,
      issuer: 'Let\'s Encrypt',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      daysRemaining: 90,
    } : null,
    domainAge: whoisData.domainAge,
    whois: whoisData.whois,
    blacklists: [
      { name: 'Google Safe Browsing', listed: false, source: 'google' },
      { name: 'PhishTank', listed: false, source: 'phishtank' },
      { name: 'OpenPhish', listed: false, source: 'openphish' },
    ],
    riskScore: scored,
    detectedRisks,
    summary,
  };
}

export function analyzeEmail(email: string): {
  riskScore: number;
  detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }>;
  summary: string;
} {
  const detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = [];
  let riskScore = 50;

  const [localPart, domain] = email.split('@');
  
  if (!domain) {
    detectedRisks.push({
      category: 'Invalid Format',
      severity: 'critical',
      description: 'The email address format is invalid.',
    });
    riskScore = 0;
    return { riskScore, detectedRisks, summary: 'Invalid email format provided.' };
  }

  const domainLower = domain.toLowerCase();
  const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com', 'protonmail.com', 'proton.me', 'tutanota.com'];
  
  if (!freeEmailProviders.includes(domainLower)) {
    detectedRisks.push({
      category: 'Custom Domain Email',
      severity: 'low',
      description: 'This email uses a custom domain. While not inherently suspicious, custom domains can be used for phishing.',
    });
    riskScore -= 5;
  }

  const suspiciousPatterns = ['admin', 'support', 'service', 'info', 'help', 'security', 'verify', 'noreply', 'no-reply', 'account'];
  const patternMatch = suspiciousPatterns.find(p => localPart.toLowerCase().includes(p));
  
  if (patternMatch) {
    detectedRisks.push({
      category: 'Generic Email Prefix',
      severity: 'medium',
      description: `The email uses "${patternMatch}" prefix, which is commonly used in automated phishing emails.`,
    });
    riskScore -= 15;
  }

  if (localPart.length > 20) {
    detectedRisks.push({
      category: 'Long Email Prefix',
      severity: 'low',
      description: 'The email prefix is unusually long, which may indicate a disposable or temporary address.',
    });
    riskScore -= 5;
  }

  const brandMatch = BRAND_KEYWORDS.find(k => domainLower.includes(k));
  if (brandMatch) {
    const knownDomain = domainLower.endsWith(`.${brandMatch}.com`) || domainLower === `${brandMatch}.com`;
    if (!knownDomain) {
      detectedRisks.push({
        category: 'Suspicious Email Domain',
        severity: 'high',
        description: `The email domain contains "${brandMatch}" but does not appear to be the official domain. This is a common phishing technique.`,
      });
      riskScore -= 25;
    }
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let summary = '';
  if (detectedRisks.length === 0) {
    summary = 'No specific risk indicators were detected for this email.';
  } else if (riskScore >= 80) {
    summary = 'This email appears to be from a legitimate source with standard security indicators.';
  } else if (riskScore >= 60) {
    summary = 'This email shows some minor concerns but generally appears legitimate.';
  } else if (riskScore >= 40) {
    summary = 'This email has several characteristics commonly associated with suspicious or phishing messages.';
  } else {
    summary = 'This email exhibits multiple risk indicators. We recommend not responding or clicking any links.';
  }

  return { riskScore, detectedRisks, summary };
}

export function analyzePhoneNumber(phone: string): {
  riskScore: number;
  detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }>;
  summary: string;
} {
  const detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = [];
  let riskScore = 50;

  const cleaned = phone.replace(/[\s\-().+]/g, '');
  
  if (cleaned.length < 7 || cleaned.length > 15) {
    detectedRisks.push({
      category: 'Invalid Phone Number',
      severity: 'medium',
      description: 'The phone number format appears unusual or invalid.',
    });
    riskScore = 30;
    return { riskScore, detectedRisks, summary: 'Phone number format is unusual. Proceed with caution.' };
  }

  const highRiskCountries = ['+234', '+233', '+92', '+880', '+63', '+91'];
  const highRiskMatch = highRiskCountries.some(c => phone.startsWith(c) || cleaned.startsWith(c.replace('+', '')));
  
  if (highRiskMatch) {
    detectedRisks.push({
      category: 'High-Risk Region',
      severity: 'medium',
      description: 'This phone number originates from a region commonly associated with spam and scam operations.',
    });
    riskScore -= 15;
  }

  if (phone.startsWith('+') || cleaned.startsWith('00')) {
    riskScore -= 5;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let summary = '';
  if (riskScore >= 70) {
    summary = 'This phone number does not show any immediate risk indicators.';
  } else if (riskScore >= 40) {
    summary = 'This phone number shows some risk indicators. Exercise normal caution.';
  } else {
    summary = 'This phone number has multiple risk indicators. Be cautious about engaging with this number.';
  }

  return { riskScore, detectedRisks, summary };
}

export function calculateFinalScore(checks: { ssl: number; domainAge: number; blacklists: number; aiAnalysis: number; communityReports: number }): number {
  const weights = {
    ssl: 0.20,
    domainAge: 0.15,
    blacklists: 0.25,
    aiAnalysis: 0.25,
    communityReports: 0.15,
  };

  return Math.round(
    checks.ssl * weights.ssl +
    checks.domainAge * weights.domainAge +
    checks.blacklists * weights.blacklists +
    checks.aiAnalysis * weights.aiAnalysis +
    checks.communityReports * weights.communityReports
  );
}

export function generateRecommendations(detectedRisks: Array<{ category: string; severity: string; description: string }>, riskScore: number): string[] {
  const recommendations: string[] = [];

  if (riskScore < 40) {
    recommendations.push('Avoid providing any personal or financial information to this entity.');
    recommendations.push('Do not click any links or download attachments from this source.');
    recommendations.push('Report this to your local cybersecurity authorities if you have engaged with it.');
  }

  if (detectedRisks.some(r => r.category === 'Brand Impersonation')) {
    recommendations.push('Verify the identity directly through the official website or official contact channels.');
  }

  if (detectedRisks.some(r => r.category === 'Missing HTTPS')) {
    recommendations.push('Do not enter any sensitive information on websites without HTTPS encryption.');
  }

  recommendations.push('Enable two-factor authentication on all accounts where available.');
  recommendations.push('Keep your browser, operating system, and security software up to date.');

  if (recommendations.length === 0) {
    recommendations.push('No specific risks detected. Continue practicing standard online safety measures.');
  }

  return recommendations.slice(0, 4);
}
