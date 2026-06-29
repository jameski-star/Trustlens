import * as cheerio from 'cheerio';
import { CommunityReport } from '../models/CommunityReport';
import { cacheWrap } from '../utils/cache';

const CACHE_TTL_REP = 120_000;

interface ReputationResult {
  source: string;
  listed: boolean;
  details: string;
  url: string;
}

async function fetchJson(url: string, timeoutMs = 5000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TrustLens/1.0', 'Accept': 'application/json' },
    });
    return await res.json() as unknown;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string, timeoutMs = 5000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TrustLens/1.0' },
    });
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function checkGoogleSafeBrowsing(url: string, apiKey: string): Promise<ReputationResult> {
  if (!apiKey) {
    return { source: 'Google Safe Browsing', listed: false, details: 'No API key configured', url: '' };
  }
  return cacheWrap(`gsb:${url}`, async () => {
    try {
      const data = await fetchJson(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        5000
      ) as { matches?: Array<{ threatType: string }> };
      if (data.matches?.length) {
        return {
          source: 'Google Safe Browsing',
          listed: true,
          details: `Flagged for: ${data.matches.map((m) => m.threatType).join(', ')}`,
          url: 'https://transparencyreport.google.com/safe-browsing/search',
        };
      }
      return { source: 'Google Safe Browsing', listed: false, details: 'Not listed', url: '' };
    } catch {
      return { source: 'Google Safe Browsing', listed: false, details: 'Lookup failed', url: '' };
    }
  }, CACHE_TTL_REP);
}

export async function checkPhishTank(hostname: string): Promise<ReputationResult> {
  return cacheWrap(`phishtank:${hostname}`, async () => {
    try {
      const data = await fetchJson(
        `https://checkurl.phishtank.com/checkurl/?url=http://${hostname}&format=json&app_key=`
      ) as { results?: { in_phish_tank?: boolean } };
      if (data?.results?.in_phish_tank) {
        return { source: 'PhishTank', listed: true, details: 'Listed in PhishTank database', url: 'https://phishtank.org/' };
      }
      return { source: 'PhishTank', listed: false, details: 'Not listed', url: '' };
    } catch {
      return { source: 'PhishTank', listed: false, details: 'Lookup failed', url: '' };
    }
  }, CACHE_TTL_REP);
}

export async function checkUrlScanIo(domain: string): Promise<ReputationResult> {
  return cacheWrap(`urlscan:${domain}`, async () => {
    try {
      const data = await fetchJson(`https://urlscan.io/api/v1/search/?q=domain:${domain}&size=1`) as {
        results?: Array<Record<string, unknown>>;
        total?: number;
      };
      if (data.total && data.total > 0) {
        const malicious = (data.results || []).filter((r) => {
          const verdict = r.verdicts as Record<string, unknown> || {};
          const overall = verdict.overall as Record<string, unknown> || {};
          return overall.malicious;
        });
        if (malicious.length > 0) {
          return { source: 'URLScan.io', listed: true, details: `Flagged as malicious by URLScan.io (${malicious.length} reports)`, url: `https://urlscan.io/domain/${domain}` };
        }
        return { source: 'URLScan.io', listed: false, details: `Found ${data.total} scans, none flagged malicious`, url: `https://urlscan.io/domain/${domain}` };
      }
      return { source: 'URLScan.io', listed: false, details: 'No scans found', url: '' };
    } catch {
      return { source: 'URLScan.io', listed: false, details: 'Lookup failed', url: '' };
    }
  }, CACHE_TTL_REP);
}

export async function checkAbuseIpDb(ip: string, apiKey: string): Promise<ReputationResult> {
  if (!apiKey || !ip) {
    return { source: 'AbuseIPDB', listed: false, details: !apiKey ? 'No API key' : 'No IP to check', url: '' };
  }
  return cacheWrap(`abuseipdb:${ip}`, async () => {
    try {
      const data = await fetchJson(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, 5000) as {
        data?: { abuseConfidenceScore: number; totalReports: number };
      };
      if (data?.data && data.data.abuseConfidenceScore > 0) {
        return { source: 'AbuseIPDB', listed: true, details: `Abuse confidence: ${data.data.abuseConfidenceScore}%, Reports: ${data.data.totalReports}`, url: `https://www.abuseipdb.com/check/${ip}` };
      }
      return { source: 'AbuseIPDB', listed: false, details: 'Clean', url: '' };
    } catch {
      return { source: 'AbuseIPDB', listed: false, details: 'Lookup failed', url: '' };
    }
  }, CACHE_TTL_REP);
}

export async function checkCommunityReports(hostname: string): Promise<{ count: number; positive: number; negative: number }> {
  try {
    const regex = hostname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const [total, positive, negative] = await Promise.all([
      CommunityReport.countDocuments({ target: { $regex: regex, $options: 'i' }, status: 'published' }),
      CommunityReport.countDocuments({ target: { $regex: regex, $options: 'i' }, status: 'published', category: 'malicious' }),
      CommunityReport.countDocuments({ target: { $regex: regex, $options: 'i' }, status: 'published', category: 'safe' }),
    ]);
    return { count: total, positive, negative };
  } catch {
    return { count: 0, positive: 0, negative: 0 };
  }
}

export async function scrapeScamDoc(domain: string): Promise<ReputationResult> {
  return cacheWrap(`scamdoc:${domain}`, async () => {
    try {
      const html = await fetchText(`https://www.scamadviser.com/check-website/${domain}`, 8000);
      const $ = cheerio.load(html);
      const text = $('body').text().toLowerCase();
      if (text.includes('trust') && (text.includes('high') || text.includes('100'))) {
        return { source: 'ScamAdviser', listed: false, details: 'Trust score appears positive', url: `https://www.scamadviser.com/check-website/${domain}` };
      }
      if (text.includes('untrust') || text.includes('risk') || text.includes('danger') || text.includes('scam')) {
        return { source: 'ScamAdviser', listed: true, details: 'Flagged as potentially risky', url: `https://www.scamadviser.com/check-website/${domain}` };
      }
      return { source: 'ScamAdviser', listed: false, details: 'No clear risk signal', url: `https://www.scamadviser.com/check-website/${domain}` };
    } catch {
      return { source: 'ScamAdviser', listed: false, details: 'Lookup failed', url: '' };
    }
  }, CACHE_TTL_REP);
}

export async function scanAllReputations(hostname: string, ip: string): Promise<{
  results: ReputationResult[];
  communityReports: { count: number; positive: number; negative: number };
}> {
  const [gsb, phish, urlscan, abuse, scamdoc, community] = await Promise.allSettled([
    checkGoogleSafeBrowsing(`https://${hostname}`, ''),
    checkPhishTank(hostname),
    checkUrlScanIo(hostname),
    checkAbuseIpDb(ip, ''),
    scrapeScamDoc(hostname),
    checkCommunityReports(hostname),
  ]);

  const results: ReputationResult[] = [];
  if (gsb.status === 'fulfilled') results.push(gsb.value);
  if (phish.status === 'fulfilled') results.push(phish.value);
  if (urlscan.status === 'fulfilled') results.push(urlscan.value);
  if (abuse.status === 'fulfilled') results.push(abuse.value);
  if (scamdoc.status === 'fulfilled') results.push(scamdoc.value);

  const communityResult = community.status === 'fulfilled' ? community.value : { count: 0, positive: 0, negative: 0 };

  return { results, communityReports: communityResult };
}
