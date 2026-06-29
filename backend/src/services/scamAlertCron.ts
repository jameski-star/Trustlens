import cron from 'node-cron';
import RssParser from 'rss-parser';
import { BlogPost } from '../models/BlogPost';
import { logger } from '../utils/logger';
import { scrapeArticle } from './contentScraper';
import { config } from '../config';

const parser = new RssParser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; TrustLensBot/1.0; +https://trustlens.website)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  timeout: 10000,
});

const DEFAULT_FEEDS: { url: string; category: string }[] = [
  { url: 'https://thehackernews.com/feeds/posts/default', category: 'Phishing' },
  { url: 'https://krebsonsecurity.com/feed/', category: 'Cyber Crime' },
  { url: 'https://www.bleepingcomputer.com/feed/', category: 'Online Safety' },
  { url: 'https://socialcatfish.com/scamfish/feed/', category: 'Social Media Scams' },
  { url: 'https://www.scamwatch.gov.au/rss/scamwatch-alerts', category: 'Scam Alert' },
  { url: 'https://www.fbi.gov/feeds/ecrime-alerts', category: 'Cyber Crime' },
  { url: 'https://us-cert.cisa.gov/ncas/alerts.xml', category: 'Security Advisory' },
  { url: 'https://www.welivesecurity.com/feed/', category: 'Online Safety' },
];

const MIN_CONTENT_LENGTH = 300;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

function cleanRssContent(raw: string): string {
  if (!raw) return '';

  let html = raw
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/<div[^>]*yarpp[\s\S]*?<\/div>/gi, '')
    .replace(/<div class=["']sharedaddy[\s\S]*?<\/div>/gi, '')
    .replace(/<div id=["']jp-post-flair[\s\S]*?<\/div>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<p>\s*The post\s.*?(?:appeared first on|was originally published on).*?<\/p>/gi, '')
    .replace(/<p>\s*Last Updated on.*?by.*?<\/p>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
    .trim();

  html = html.replace(/\bLast Updated on\s.+?by\s.+?(?=<|$)/g, '');
  html = html.replace(/\bThe post\s.+?appeared first on\s.+?\./g, '');
  html = html.replace(/Related posts:[\s\S]*?(?=<|$)/g, '');
  html = html.replace(/YARPP[\s\S]*?(?=<|$)/g, '');

  if (!html.includes('<') && html.length > 0) {
    const paragraphs = html.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    html = paragraphs.map(p => `<p>${p}</p>`).join('\n');
  }

  return html;
}

function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function processFeed(feed: { url: string; category: string }): Promise<void> {
  let feedResult;
  try {
    feedResult = await parser.parseURL(feed.url);
  } catch (err) {
    logger.warn({ err, url: feed.url }, 'Failed to fetch RSS feed');
    return;
  }

  if (!feedResult.items?.length) return;

  for (const item of feedResult.items) {
    const title = item.title?.trim();
    if (!title) continue;

    const slug = slugify(title);
    const rawContent = item.content || item.contentSnippet || '';
    const cleanedHtml = cleanRssContent(rawContent);
    const plainText = toPlainText(cleanedHtml);
    const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
    const itemLink = item.link || '';

    let finalContent = cleanedHtml || plainText;
    let finalExcerpt = plainText.substring(0, 500);
    const rawItem = item as Record<string, unknown>;
    const mediaThumbnail = rawItem['media:thumbnail'];
    const thumbnailUrl = mediaThumbnail && typeof mediaThumbnail === 'object'
      ? (mediaThumbnail as { $?: { url?: string } })['$']?.url || '' : '';
    let coverImage = item.enclosure?.url || thumbnailUrl || '';

    if (plainText.length < MIN_CONTENT_LENGTH && itemLink) {
      const scraped = await scrapeArticle(itemLink);
      if (scraped) {
        finalContent = scraped.content || finalContent;
        finalExcerpt = scraped.excerpt || finalExcerpt;
        if (scraped.title && scraped.title.length > title.length) {
          logger.debug({ slug }, 'Scraped longer title for article');
        }
        if (scraped.coverImage && !coverImage) {
          coverImage = scraped.coverImage;
        }
      }
    }

    try {
      await BlogPost.findOneAndUpdate(
        { slug },
        {
          title: title.substring(0, 200),
          slug,
          excerpt: finalExcerpt || 'No excerpt available.',
          content: finalContent,
          category: feed.category,
          coverImage,
          tags: [feed.category],
          author: 'TrustLens Security Team',
          published: true,
          publishedAt: pubDate,
          seo: {
            metaTitle: title.substring(0, 60),
            metaDescription: finalExcerpt.substring(0, 160),
            canonicalUrl: itemLink,
          },
        },
        { upsert: true, new: true },
      );
      logger.info({ title, slug }, 'Upserted blog post from RSS');
    } catch (err: unknown) {
      logger.warn({ err, title }, 'Failed to upsert blog post from RSS');
    }
  }
}

export function startScamAlertCron(): void {
  const feeds = config.rssFeeds?.length ? config.rssFeeds : DEFAULT_FEEDS;

  cron.schedule('0 */6 * * *', async () => {
    logger.info({ feedCount: feeds.length }, 'Running scam alert RSS cron');
    for (const feed of feeds) {
      await processFeed(feed);
    }
  });

  logger.info({ feedCount: feeds.length }, 'Scam alert cron scheduled (every 6 hours)');
}
