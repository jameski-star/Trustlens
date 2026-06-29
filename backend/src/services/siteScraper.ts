import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import { cacheWrap } from '../utils/cache';

const SCRAPE_TIMEOUT = 5000;
const CACHE_TTL_SCRAPE = 120_000;

export interface SiteScrapeResult {
  title: string;
  description: string;
  keywords: string[];
  hasForms: boolean;
  formActions: string[];
  externalScripts: string[];
  externalIframes: string[];
  redirects: string[];
  hasPrivacyPolicy: boolean;
  hasContactPage: boolean;
  hasLoginForm: boolean;
  hasPasswordField: boolean;
  contentLength: number;
  pageLanguage: string;
  socialMediaLinks: string[];
  techStack: string[];
  contentSamples: string[];
  risks: string[];
}

const SOCIAL_DOMAINS = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com',
  'youtube.com', 'tiktok.com', 'x.com', 'github.com'];

const SUSPICIOUS_CONTENT_PATTERNS = [
  { pattern: /credit card|ssn|social security|bank account|routing number/gi, risk: 'Requests for sensitive financial information on page' },
  { pattern: /congratulations.*won|you.*winner|lottery.*prize/gi, risk: 'Contains lottery or prize-winning language' },
  { pattern: /investment.*guaranteed|guaranteed.*return|risk.?free|double.*money/gi, risk: 'Contains guaranteed returns language (investment scam)' },
  { pattern: /western union|money gram|wire transfer|gift card|cryptocurrency.*payment/gi, risk: 'Mentions irreversible payment methods' },
  { pattern: /urgent.*action|account.*suspended|limited.*access|verify.*immediately/gi, risk: 'Contains urgency pressure tactics' },
  { pattern: /under.*construction|coming.*soon|site.*launching/gi, risk: 'Site may be newly created or under construction' },
];

const TECH_STACK_CHECKS = [
  { selector: 'meta[name="generator"]', attr: 'content', prefix: '', match: null },
  { selector: 'script[src*="jquery"]', match: 'jQuery' },
  { selector: 'script[src*="react"]', match: 'React' },
  { selector: 'script[src*="angular"]', match: 'Angular' },
  { selector: 'script[src*="vue"]', match: 'Vue' },
  { selector: 'link[href*="bootstrap"]', match: 'Bootstrap' },
  { selector: 'link[href*="tailwind"]', match: 'TailwindCSS' },
  { selector: 'meta[name="generator"][content*="WordPress"]', match: 'WordPress' },
  { selector: 'link[href*="wp-content"]', match: 'WordPress' },
];

export async function scrapeSite(url: string): Promise<SiteScrapeResult | null> {
  return cacheWrap(`scrape:${url}`, async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT);

      let finalUrl = url;
      const redirects: string[] = [url];

      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          finalUrl = new URL(location, url).href;
          redirects.push(finalUrl);
        }
      }

      const html = await response.text();
      clearTimeout(timeoutId);

      const $ = cheerio.load(html);
      const risks: string[] = [];

      const title = $('title').first().text().trim() ||
        $('meta[property="og:title"]').attr('content') || '';
      const description = $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') || '';
      const keywords = ($('meta[name="keywords"]').attr('content') || '')
        .split(',').map(k => k.trim()).filter(Boolean);

      const hasForms = $('form').length > 0;
      const formActions: string[] = [];
      $('form').each((_, el) => {
        const action = $(el).attr('action');
        if (action) formActions.push(action);
      });

      const externalScripts: string[] = [];
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src') || '';
        if (src && !src.startsWith('data:')) externalScripts.push(src);
      });

      const externalIframes: string[] = [];
      $('iframe').each((_, el) => {
        const src = $(el).attr('src') || '';
        if (src) externalIframes.push(src);
      });

      const hasLoginForm = $('input[type="password"]').length > 0 ||
        $('form').toArray().some(el => $(el).text().toLowerCase().includes('login'));
      const hasPasswordField = $('input[type="password"]').length > 0;
      const htmlLower = html.toLowerCase();
      const hasPrivacyPolicy = htmlLower.includes('privacy policy') ||
        (htmlLower.includes('privacy') && $('a[href*="privacy"]').length > 0);
      const hasContactPage = htmlLower.includes('contact') &&
        $('a[href*="contact"]').length > 0;

      const socialMediaLinks: string[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (SOCIAL_DOMAINS.some(d => href.includes(d))) socialMediaLinks.push(href);
      });

      const pageLanguage = $('html').attr('lang') ||
        $('meta[http-equiv="content-language"]').attr('content') || '';

      const bodyText = $('body').text();
      const bodyTextLower = bodyText.toLowerCase();
      const contentLength = bodyText.length;

      const contentSamples: string[] = [];
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 50) contentSamples.push(text.substring(0, 200));
      });

      const techStack: string[] = [];
      for (const check of TECH_STACK_CHECKS) {
        if (check.match) {
          if ($(check.selector).length) {
            if (!techStack.includes(check.match)) techStack.push(check.match);
          }
        } else if (check.selector === 'meta[name="generator"]') {
          const val = $(check.selector).attr('content');
          if (val) techStack.push(val);
        }
      }

      if (contentLength < 100) risks.push('Site has very minimal content — may be a parked domain or landing page');
      if (!hasPrivacyPolicy) risks.push('No privacy policy found — legitimate sites typically have one');
      if (!hasContactPage) risks.push('No contact page found — reduces accountability');
      if (externalIframes.length > 2) risks.push('Excessive external iframes — could be serving third-party content');
      if (formActions.length > 0 && formActions.some(a => a === '' || a === '#' || a.startsWith('http://'))) risks.push('Forms submit to insecure or empty actions — potential data harvesting');
      if (redirects.length > 2) risks.push('Multiple redirects detected — may be hiding the final destination');
      if (externalScripts.length > 20) risks.push('Excessive external scripts — potential tracking or malware delivery');
      if (keywords.length === 0 && contentLength > 0) risks.push('No meta keywords — poor SEO, common in low-effort scam sites');

      for (const { pattern, risk } of SUSPICIOUS_CONTENT_PATTERNS) {
        if (pattern.test(bodyTextLower)) risks.push(risk);
      }

      return {
        title, description, keywords,
        hasForms, formActions, externalScripts, externalIframes,
        redirects, hasPrivacyPolicy, hasContactPage,
        hasLoginForm, hasPasswordField,
        contentLength, pageLanguage, socialMediaLinks,
        techStack, contentSamples: contentSamples.slice(0, 5),
        risks,
      };
    } catch (err) {
      logger.warn({ err, url }, 'Failed to scrape site');
      return null;
    }
  }, CACHE_TTL_SCRAPE);
}
