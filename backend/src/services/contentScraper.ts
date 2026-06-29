import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';

interface ScrapedArticle {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: Date | null;
  coverImage: string;
}

interface SitePattern {
  article: string;
  title: string;
  content: string;
  author: string;
  date: string;
  image: string;
}

const SCRAPE_TIMEOUT_MS = 8000;

const DEFAULT_PATTERN: SitePattern = {
  article: 'article, main, .post, .entry, .content',
  title: 'h1',
  content: '.entry-content, .post-content, .article-body, .content-body, article',
  author: '.author, .byline, meta[name="author"]',
  date: 'meta[property="article:published_time"], time',
  image: 'meta[property="og:image"]',
};

const SITE_PATTERNS: Record<string, SitePattern> = {
  'thehackernews.com': { article: 'main', title: 'h1', content: '.article-body', author: '.author', date: 'meta[itemprop="datePublished"]', image: 'meta[property="og:image"]' },
  'krebsonsecurity.com': { article: 'article', title: '.entry-title', content: '.entry-content', author: '.author', date: 'meta[property="article:published_time"]', image: 'meta[property="og:image"]' },
  'bleepingcomputer.com': { article: 'main', title: 'h1', content: '.articleBody', author: '.author-name', date: 'meta[property="article:published_time"]', image: 'meta[property="og:image"]' },
  'socialcatfish.com': { article: 'article', title: 'h1', content: '.entry-content', author: '.author-name', date: 'meta[property="article:published_time"]', image: 'meta[property="og:image"]' },
};

const STRIP_TAGS_RE = /<\/?(?:script|style|nav|footer|header|aside|form|iframe|svg|figure|ins)[^>]*>/gi;
const STRIP_BLOCKS_RE = /<(?:script|style|nav|footer|header|aside|form|iframe|svg|figure|ins)[\s\S]*?<\/(?:script|style|nav|footer|header|aside|form|iframe|svg|figure|ins)>/gi;

function getPattern(site: string): SitePattern {
  for (const [domain, pattern] of Object.entries(SITE_PATTERNS)) {
    if (site.includes(domain)) return pattern;
  }
  return DEFAULT_PATTERN;
}

function cleanArticleHtml(html: string): string {
  const cleaned = html
    .replace(STRIP_BLOCKS_RE, '')
    .replace(STRIP_TAGS_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const $ = cheerio.load(cleaned);
  $('a[rel~="nofollow"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) $(el).replaceWith(text);
  });
  $('div:empty, p:empty, span:empty, .sharedaddy, #jp-post-flair, .yarpp-related, .rp4wp-related').remove();

  return $.html() || cleaned;
}

export async function scrapeArticle(url: string): Promise<ScrapedArticle | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);

    let html: string;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TrustLensBot/1.0; +https://trustlens.website)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      html = await response.text();
    } catch {
      logger.debug({ url }, 'Failed to fetch article URL');
      return null;
    } finally {
      clearTimeout(timeoutId);
    }

    const $ = cheerio.load(html);
    const site = new URL(url).hostname.replace(/^www\./, '');
    const pattern = getPattern(site);

    const title = $(pattern.title).first().text().trim() ||
      $('meta[property="og:title"]').attr('content') || '';
    if (!title) return null;

    const contentEl = $(pattern.content).first();
    let contentHtml = contentEl.length ? (contentEl.html() || '') : '';

    if (!contentHtml || contentHtml.length < 200) {
      const fallbacks = ['.post-content', '.entry-content', '.article-body', 'article', 'main'];
      for (const sel of fallbacks) {
        const el = $(sel).first();
        const h = el.html() || '';
        if (h.length > contentHtml.length) contentHtml = h;
      }
    }

    contentHtml = cleanArticleHtml(contentHtml);

    const textContent = $(`<div>${contentHtml}</div>`).text() ||
      $(pattern.content).first().text() || '';

    const excerpt = textContent.substring(0, 500).replace(/\s+/g, ' ').trim() ||
      $('meta[name="description"]').attr('content') || '';

    const author = $(pattern.author).first().text().trim() ||
      $('meta[name="author"]').attr('content') ||
      'TrustLens Security Team';

    let publishedAt: Date | null = null;
    const dateEl = $(pattern.date).first();
    const dateStr = dateEl.attr('content') || dateEl.attr('datetime') || dateEl.text().trim();
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) publishedAt = parsed;
    }

    const coverImage = $(pattern.image).attr('content') ||
      $('meta[property="og:image"]').attr('content') || '';

    return {
      title,
      content: contentHtml || textContent,
      excerpt,
      author,
      publishedAt,
      coverImage,
    };
  } catch (err) {
    logger.warn({ err, url }, 'Error scraping article');
    return null;
  }
}
