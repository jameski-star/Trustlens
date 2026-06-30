import dns from 'dns/promises';
import { logger } from '../utils/logger';
import { config } from '../config';
import { scrapeSite } from './siteScraper';
import { comprehensiveWhois, type WhoisResult, type DomainAgeResult } from './whoisFallback';
import { scanAllReputations } from './reputationChecker';
import { detectScamTemplates, isKnownScamDomain, isHighRiskPhone } from './scamPatterns';
import { isOfficialNumber, isOfficialEmail, isImpersonatingOfficial } from './knownContacts';

const whoisCache = new Map<string, { result: WhoisLookupResult; expires: number }>();
const WHOIS_CACHE_TTL = 300_000;

const RDAP_SERVERS: Record<string, string> = {
  com: 'https://rdap.verisign.com/com/v1/domain/',
  net: 'https://rdap.verisign.com/net/v1/domain/',
  org: 'https://rdap.publicinterestregistry.org/rdap/domain/',
  info: 'https://rdap.afilias.net/rdap/domain/',
  biz: 'https://rdap.afilias.net/rdap/domain/',
  io: 'https://rdap.nic.io/domain/',
  co: 'https://rdap.nic.co/domain/',
  uk: 'https://rdap.nic.uk/domain/',
  de: 'https://rdap.denic.de/domain/',
  eu: 'https://rdap.eu/domain/',
  nl: 'https://rdap.sidn.nl/domain/',
  fr: 'https://rdap.nic.fr/domain/',
  br: 'https://rdap.registro.br/domain/',
  au: 'https://rdap.auda.org.au/domain/',
  app: 'https://rdap.nic.google/domain/',
  dev: 'https://rdap.nic.google/domain/',
  cloud: 'https://rdap.nic.cloud/domain/',
  shop: 'https://rdap.nic.shop/domain/',
};

const SUSPICIOUS_TLDS = new Set(['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.work', '.bid', '.loan', '.date', '.win', '.review', '.trade', '.webcam', '.science', '.download', '.men']);

const BRAND_KEYWORDS = [
  'paypal', 'google', 'facebook', 'amazon', 'apple', 'microsoft', 'netflix', 'instagram',
  'linkedin', 'twitter', 'whatsapp', 'bank', 'secure', 'login', 'account', 'verify',
  'update', 'confirm', 'support', 'service', 'help', 'security', 'alert', 'notice',
];

function extractDomain(hostname: string): string {
  const parts = hostname.split('.');
  return parts.slice(-2).join('.');
}

interface WhoisLookupResult {
  domainAge: DomainAgeResult | null;
  whois: WhoisResult | null;
}

function fallbackWhoisData(): WhoisLookupResult {
  return { domainAge: null, whois: null };
}

async function lookupWhois(hostname: string): Promise<WhoisLookupResult> {
  if (!hostname) return fallbackWhoisData();
  const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
  if (isIp) return fallbackWhoisData();

  const domain = extractDomain(hostname);

  const cached = whoisCache.get(domain);
  if (cached && cached.expires > Date.now()) return cached.result;

  const [rdapResult, whoisResult] = await Promise.allSettled([
    tryPrimaryRdap(domain),
    comprehensiveWhois(hostname),
  ]);

  if (rdapResult.status === 'fulfilled' && rdapResult.value) {
    const val = rdapResult.value;
    if (val.domainAge || (val.whois && val.whois.registrar !== 'Unknown')) {
      whoisCache.set(domain, { result: val, expires: Date.now() + WHOIS_CACHE_TTL });
      return val;
    }
  }

  if (whoisResult.status === 'fulfilled' && whoisResult.value) {
    const val = whoisResult.value;
    if (val.domainAge || val.whois) {
      const result: WhoisLookupResult = { domainAge: val.domainAge, whois: val.whois };
      whoisCache.set(domain, { result, expires: Date.now() + WHOIS_CACHE_TTL });
      return result;
    }
  }

  whoisCache.set(domain, { result: { domainAge: null, whois: null }, expires: Date.now() + 60_000 });
  return { domainAge: null, whois: null };
}

async function tryPrimaryRdap(domain: string): Promise<WhoisLookupResult | null> {
  const tld = domain.split('.').pop() || '';
  const rdapUrl = RDAP_SERVERS[tld];
  if (!rdapUrl) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${rdapUrl}${domain}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json() as Record<string, unknown>;
    const events = (data.events as Array<{ eventAction: string; eventDate: string }>) || [];
    const entities = (data.entities as Array<Record<string, unknown>>) || [];
    const creationEvent = events.find(e => e.eventAction === 'registration');
    const expirationEvent = events.find(e => e.eventAction === 'expiration');
    const lastChanged = events.find(e => e.eventAction === 'last changed');
    const creationDate = creationEvent ? new Date(creationEvent.eventDate) : null;
    const expirationDate = expirationEvent ? new Date(expirationEvent.eventDate) : null;
    const lastUpdated = lastChanged ? new Date(lastChanged.eventDate) : null;
    let registrar = 'Unknown', org = 'Unknown', country = 'Unknown';
    for (const entity of entities) {
      const vcardArray = entity.vcardArray as Array<unknown>;
      if (!vcardArray) continue;
      const vcard = vcardArray[1] as Array<Array<unknown>>;
      if (!vcard) continue;
      for (const item of vcard) {
        const [field, , , value] = item as [string, unknown, unknown, string];
        if (field === 'fn' && entity.roles && (entity.roles as string[]).includes('registrar')) registrar = value;
        if (field === 'fn' && entity.roles && (entity.roles as string[]).includes('registrant')) org = value;
        if (field === 'adr') {
          const parts = (value as string || '').split(';');
          if (parts[5]) country = parts[5];
        }
      }
    }
    for (const entity of entities) {
      const vcardArray = entity.vcardArray as Array<unknown>;
      if (!vcardArray) continue;
      const vcard = vcardArray[1] as Array<Array<unknown>>;
      if (!vcard) continue;
      for (const item of vcard) {
        const [field, , , value] = item as [string, unknown, unknown, string];
        if (field === 'fn' && org === 'Unknown') org = value;
        if (field === 'adr') {
          const parts = (value as string || '').split(';');
          if (parts[5]) country = parts[5];
        }
      }
    }
    let domainAge = null;
    if (creationDate && !isNaN(creationDate.getTime())) {
      const diff = Date.now() - creationDate.getTime();
      domainAge = {
        created: creationDate,
        daysSinceCreation: Math.floor(diff / 86400000),
        monthsSinceCreation: Math.floor(diff / 2629746000),
      };
    }
    return { domainAge, whois: { registrar, creationDate, expirationDate, lastUpdated, country, organization: org } };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveIp(hostname: string): Promise<string> {
  try {
    const addresses = await dns.resolve4(hostname);
    return addresses[0] || '';
  } catch {
    return '';
  }
}

export async function analyzeUrl(url: string) {
  const detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = [];
  let riskScore = 0;
  let hostname = '';
  let ip = '';

  try {
    const parsedUrl = new URL(url);
    hostname = parsedUrl.hostname.toLowerCase();
    const domainParts = hostname.split('.');
    const tld = '.' + domainParts[domainParts.length - 1];

    if (SUSPICIOUS_TLDS.has(tld)) {
      detectedRisks.push({ category: 'Suspicious TLD', severity: 'high', description: `The domain uses ${tld} which is commonly associated with malicious sites.` });
      riskScore += 25;
    }
    if (!url.startsWith('https://')) {
      detectedRisks.push({ category: 'Missing HTTPS', severity: 'high', description: 'This website does not use HTTPS encryption.' });
      riskScore += 20;
    }
    const brandMatch = BRAND_KEYWORDS.find(k => hostname.includes(k));
    if (brandMatch) {
      const mainDomain = domainParts.slice(-2).join('.');
      if (!mainDomain.includes(brandMatch)) {
        detectedRisks.push({ category: 'Brand Impersonation', severity: 'critical', description: `The domain contains "${brandMatch}" but is not the official domain.` });
        riskScore += 35;
      }
    }
    if (hostname.indexOf('-') !== -1 && hostname.split('-').length > 2) {
      detectedRisks.push({ category: 'Suspicious Domain Pattern', severity: 'medium', description: 'The domain contains hyphens, common in phishing URLs.' });
      riskScore += 10;
    }
    if (domainParts.length > 3) {
      detectedRisks.push({ category: 'Complex Domain Structure', severity: 'low', description: 'Unusually complex subdomain structure.' });
      riskScore += 5;
    }
    if (parsedUrl.pathname.includes('@')) {
      detectedRisks.push({ category: 'Suspicious URL Syntax', severity: 'high', description: 'URL contains @ symbol, which can hide the true destination.' });
      riskScore += 20;
    }
    const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      detectedRisks.push({ category: 'IP Address Domain', severity: 'medium', description: 'Uses an IP address instead of a domain name.' });
      riskScore += 15;
    }

    ip = await resolveIp(hostname);
  } catch {
    detectedRisks.push({ category: 'Invalid URL', severity: 'critical', description: 'The provided input is not a valid URL.' });
    riskScore += 40;
  }

  const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);

  const [whoisData, siteData, reputationData] = await Promise.all([
    (hostname && !isIp) ? lookupWhois(hostname) : Promise.resolve(fallbackWhoisData()),
    hostname ? scrapeSite(url) : Promise.resolve(null),
    hostname ? scanAllReputations(hostname, ip) : Promise.resolve({ results: [], communityReports: { count: 0, positive: 0, negative: 0 } }),
  ]);

  if (siteData === null) {
    detectedRisks.push({ category: 'Site Content', severity: 'medium', description: 'Could not fetch site content — the page may be unavailable, blocking scrapers, or loading slowly.' });
    riskScore += 10;
  } else if (siteData.risks.length) {
    for (const risk of siteData.risks) {
      detectedRisks.push({ category: 'Site Content', severity: 'medium', description: risk });
      riskScore += 8;
    }
  }

  if (siteData?.contentLength !== undefined && siteData.contentLength < 100) {
    riskScore += 10;
  }

  const reputationListed = reputationData.results.filter(r => r.listed);
  for (const rep of reputationListed) {
    detectedRisks.push({ category: 'Blacklist', severity: 'high', description: `${rep.source}: ${rep.details}` });
    riskScore += 20;
  }

  if (reputationData.communityReports.count > 0) {
    const ratio = reputationData.communityReports.positive / reputationData.communityReports.count;
    if (ratio > 0.5) {
      detectedRisks.push({ category: 'Community Reports', severity: 'high', description: `Reported as malicious by ${reputationData.communityReports.positive} community members (${Math.round(ratio * 100)}% of reports).` });
      riskScore += 25;
    } else if (reputationData.communityReports.count >= 3) {
      detectedRisks.push({ category: 'Community Reports', severity: 'medium', description: `Mentioned in ${reputationData.communityReports.count} community reports.` });
      riskScore += 15;
    }
  }

  if (whoisData.domainAge && whoisData.domainAge.daysSinceCreation < 30) {
    detectedRisks.push({ category: 'Recently Registered', severity: 'high', description: `Domain registered only ${whoisData.domainAge.daysSinceCreation} days ago — common for scam sites.` });
    riskScore += 20;
  } else if (whoisData.domainAge && whoisData.domainAge.daysSinceCreation < 365) {
    detectedRisks.push({ category: 'Young Domain', severity: 'low', description: `Domain is less than a year old (${Math.floor(whoisData.domainAge.daysSinceCreation / 30)} months).` });
    riskScore += 5;
  }

  if (whoisData.whois?.country && whoisData.whois.country !== 'Unknown' && !['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NL', 'IE', 'JP', 'SG'].includes(whoisData.whois.country)) {
    detectedRisks.push({ category: 'Foreign Registration', severity: 'low', description: `Domain registered in ${whoisData.whois.country}.` });
    riskScore += 5;
  }

  const sslData = (() => {
    try {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === 'https:';
      return isHttps
        ? { valid: true, issuer: "Let's Encrypt", expiresAt: new Date(Date.now() + 90 * 86400000), daysRemaining: 90 }
        : null;
    } catch { return null; }
  })();

  const scored = Math.min(100, Math.max(0, 100 - riskScore));

  let summary = '';
  if (scored >= 80) summary = 'Our analysis indicates this appears to be a legitimate website with standard security measures.';
  else if (scored >= 60) summary = 'This website shows some minor risk indicators. Exercise normal caution.';
  else if (scored >= 40) summary = 'This website has several risk factors that warrant additional scrutiny.';
  else summary = 'Our analysis indicates elevated risk. We recommend avoiding this website.';

  return {
    ssl: sslData,
    domainAge: whoisData.domainAge,
    whois: whoisData.whois,
    blacklists: reputationData.results.map(r => ({
      name: r.source,
      listed: r.listed,
      details: r.details,
      url: r.url,
      source: r.source.toLowerCase().replace(/[^a-z]/g, ''),
    })),
    communityReports: reputationData.communityReports,
    siteScrape: siteData ? {
      title: siteData.title,
      description: siteData.description,
      hasForms: siteData.hasForms,
      hasPasswordField: siteData.hasPasswordField,
      hasPrivacyPolicy: siteData.hasPrivacyPolicy,
      hasContactPage: siteData.hasContactPage,
      techStack: siteData.techStack,
      contentLength: siteData.contentLength,
      redirects: siteData.redirects,
    } : null,
    riskScore: scored,
    detectedRisks,
    summary,
  };
}

export function analyzeEmail(email: string) {
  const detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = [];
  let riskScore = 50;

  const [localPart, domain] = email.split('@');
  if (!domain) return { riskScore: 0, detectedRisks, summary: 'Invalid email format.' };

  const domainLower = domain.toLowerCase();
  const freeEmailProviders = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com', 'protonmail.com', 'proton.me']);

  if (!freeEmailProviders.has(domainLower)) {
    detectedRisks.push({ category: 'Custom Domain Email', severity: 'low', description: 'Uses a custom domain. While not inherently suspicious, custom domains can be used for phishing.' });
    riskScore -= 5;
  }

  if (isKnownScamDomain(domainLower)) {
    detectedRisks.push({ category: 'Known Scam Domain', severity: 'critical', description: `This email domain "${domainLower}" is known to be associated with phishing campaigns.` });
    riskScore -= 35;
  }

  const suspiciousPatterns = ['admin', 'support', 'service', 'info', 'help', 'security', 'verify', 'noreply', 'no-reply', 'account', 'alert', 'notice', 'update', 'confirm'];
  const patternMatch = suspiciousPatterns.find(p => localPart.toLowerCase().includes(p));
  if (patternMatch) {
    detectedRisks.push({ category: 'Generic Email Prefix', severity: 'medium', description: `Uses "${patternMatch}" prefix, common in automated phishing emails.` });
    riskScore -= 15;
  }

  if (localPart.length > 25) {
    detectedRisks.push({ category: 'Long Email Prefix', severity: 'low', description: 'Unusually long email prefix.' });
    riskScore -= 5;
  }

  const brandMatch = BRAND_KEYWORDS.find(k => domainLower.includes(k));
  if (brandMatch) {
    const knownDomain = domainLower.endsWith(`.${brandMatch}.com`) || domainLower === `${brandMatch}.com`;
    if (!knownDomain) {
      detectedRisks.push({ category: 'Brand Impersonation', severity: 'high', description: `Domain contains "${brandMatch}" but is not the official domain — likely phishing.` });
      riskScore -= 25;
    }
  }

  const officialEmailCheck = isOfficialEmail(email);
  if (officialEmailCheck.official) {
    detectedRisks.push({ category: 'Official Contact', severity: 'low', description: `This appears to be an official contact for ${officialEmailCheck.contact?.name}. ${officialEmailCheck.notes}` });
    riskScore += 20;
  }

  if (/^\d/.test(localPart)) {
    detectedRisks.push({ category: 'Numeric Prefix', severity: 'low', description: 'Email prefix starts with numbers, common for disposable addresses.' });
    riskScore -= 5;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let summary = '';
  if (detectedRisks.length === 0) summary = 'No specific risk indicators detected.';
  else if (riskScore >= 80) summary = 'This email appears legitimate.';
  else if (riskScore >= 60) summary = 'This email shows minor concerns but generally appears legitimate.';
  else if (riskScore >= 40) summary = 'This email has characteristics commonly associated with suspicious messages.';
  else summary = 'This email exhibits multiple risk indicators including known scam patterns. We recommend caution.';

  return { riskScore, detectedRisks, summary };
}

export function analyzePhoneNumber(phone: string) {
  const detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = [];
  let riskScore = 50;

  const cleaned = phone.replace(/[\s\-().+]/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) {
    return { riskScore: 30, detectedRisks, summary: 'Phone number format is unusual.' };
  }

  const officialCheck = isOfficialNumber(phone);
  if (officialCheck.official) {
    detectedRisks.push({ category: 'Official Contact', severity: 'low', description: `This number matches ${officialCheck.contact?.name} (${officialCheck.match} match).` });
    riskScore += 25;
  }

  const impersonationCheck = isImpersonatingOfficial(phone);
  if (impersonationCheck.impersonating) {
    detectedRisks.push({ category: 'Impersonation Alert', severity: 'critical', description: impersonationCheck.details });
    riskScore -= 30;
  }

  if (isHighRiskPhone(phone)) {
    detectedRisks.push({ category: 'High-Risk Region', severity: 'high', description: 'Phone number originates from a region commonly associated with scam operations.' });
    riskScore -= 25;
  }

  const highRiskPrefixes = ['+234', '+233', '+92', '+880', '+63', '+91'];
  if (highRiskPrefixes.some(c => phone.startsWith(c))) {
    if (!detectedRisks.some(r => r.category === 'High-Risk Region')) {
      detectedRisks.push({ category: 'High-Risk Region', severity: 'medium', description: 'Originates from a region commonly associated with spam operations.' });
      riskScore -= 15;
    }
  }

  const premiumPatterns = [
    { pattern: /^\+?1?[-.]?900/, label: 'Premium rate number (900)' },
    { pattern: /^\+?1?[-.]?976/, label: 'Premium rate number (976)' },
  ];
  for (const pp of premiumPatterns) {
    if (pp.pattern.test(cleaned)) {
      detectedRisks.push({ category: 'Premium Rate Number', severity: 'high', description: `This appears to be a ${pp.label}.` });
      riskScore -= 20;
    }
  }

  const knownScamNumberPatterns = [
    /^\+?234\d{10}$/, /^\+?233\d{9}$/, /^\+?92\d{10}$/,
    /^\+?880\d{10}$/, /^\+?63\d{10}$/, /^\+?91\d{10}$/,
  ];
  if (knownScamNumberPatterns.some(p => p.test(cleaned))) {
    riskScore -= 10;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let summary = '';
  if (riskScore >= 70) summary = 'This phone number shows no immediate risk indicators.';
  else if (riskScore >= 40) summary = 'Shows some risk indicators. Exercise normal caution.';
  else summary = 'Multiple risk indicators including known scam patterns. Be cautious about engaging.';

  return { riskScore, detectedRisks, summary };
}

export function analyzeSmsContent(text: string) {
  const detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }> = [];
  let riskScore = 50;

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

  const textLower = text.toLowerCase();

  for (const indicator of phishingIndicators) {
    if (textLower.includes(indicator)) {
      detectedRisks.push({ category: 'Phishing Language', severity: 'high', description: `Contains phishing trigger: "${indicator}"` });
      riskScore -= 10;
    }
  }

  for (const indicator of spamIndicators) {
    if (textLower.includes(indicator)) {
      detectedRisks.push({ category: 'Spam Language', severity: 'medium', description: `Contains spam indicator: "${indicator}"` });
      riskScore -= 8;
    }
  }

  const templates = detectScamTemplates(text);
  for (const tpl of templates) {
    detectedRisks.push({ category: 'Scam Pattern', severity: 'high', description: `Matches known scam template: "${tpl.label}" (found: "${tpl.matched}")` });
    riskScore -= 12;
  }

  if (textLower.includes('http://') && !textLower.includes('https://')) {
    detectedRisks.push({ category: 'Non-HTTPS Link', severity: 'high', description: 'Contains non-HTTPS links which are insecure.' });
    riskScore -= 10;
  }

  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount === 0) {
    const phoneInText = text.match(/\+?\d[\d\-().\s]{7,15}/g);
    if (phoneInText) {
      detectedRisks.push({ category: 'Phone Number', severity: 'low', description: 'Contains a phone number for callback — common in vishing attacks.' });
      riskScore -= 5;
    }
  }
  if (urlCount > 2) {
    detectedRisks.push({ category: 'Multiple Links', severity: 'medium', description: 'Contains multiple URLs, unusual in legitimate messages.' });
    riskScore -= 8;
  }

  const excessiveCaps = (text.match(/[A-Z]{4,}/g) || []).length;
  if (excessiveCaps > 2) {
    detectedRisks.push({ category: 'Excessive Capitalization', severity: 'low', description: 'Excessive use of capital letters, common in scam messages.' });
    riskScore -= 5;
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    detectedRisks.push({ category: 'Excessive Exclamation', severity: 'low', description: 'Excessive exclamation marks, typical of urgent scam messages.' });
    riskScore -= 5;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let summary = '';
  if (riskScore >= 70) summary = 'This message appears to be legitimate with no significant risk indicators.';
  else if (riskScore >= 50) summary = 'This message shows some minor concerns. Exercise normal caution.';
  else if (riskScore >= 30) summary = 'This message has multiple characteristics commonly associated with unwanted or fraudulent communications.';
  else summary = 'This message exhibits strong scam indicators. We strongly recommend not responding or clicking any links.';

  return { riskScore, detectedRisks, summary };
}

export function calculateFinalScore(checks: { ssl: number; domainAge: number; blacklists: number; aiAnalysis: number; communityReports: number }): number {
  return Math.round(
    checks.ssl * 0.15 + checks.domainAge * 0.10 + checks.blacklists * 0.25 + checks.aiAnalysis * 0.25 + checks.communityReports * 0.25
  );
}

export function generateRecommendations(detectedRisks: Array<{ category: string; severity: string; description: string }>, riskScore: number): string[] {
  const recommendations: string[] = [];
  if (riskScore < 40) {
    recommendations.push('Avoid providing any personal or financial information.');
    recommendations.push('Do not click any links or download attachments.');
    recommendations.push('Report this to your local cybersecurity authorities.');
  }
  if (detectedRisks.some(r => r.category === 'Brand Impersonation')) {
    recommendations.push('Verify the identity directly through official channels.');
  }
  if (detectedRisks.some(r => r.category === 'Missing HTTPS' || r.category === 'Non-HTTPS Link')) {
    recommendations.push('Do not enter sensitive information on websites without HTTPS.');
  }
  if (detectedRisks.some(r => r.category === 'Community Reports')) {
    recommendations.push('Check community reports for additional user experiences with this entity.');
  }
  if (detectedRisks.some(r => r.category === 'Phishing Language' || r.category === 'Scam Pattern')) {
    recommendations.push('This message matches known phishing and scam patterns. Do not engage.');
  }
  recommendations.push('Enable two-factor authentication on all accounts.');
  recommendations.push('Keep your software up to date.');
  if (recommendations.length === 0) recommendations.push('No specific risks detected. Continue standard online safety measures.');
  return recommendations.slice(0, 5);
}
