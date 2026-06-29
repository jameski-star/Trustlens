import cron from 'node-cron';
import RssParser from 'rss-parser';
import { BlogPost } from '../models/BlogPost';
import { logger } from '../utils/logger';

const parser = new RssParser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; TrustLensBot/1.0; +https://trustlens.website)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  timeout: 10000,
});

const FEEDS: { url: string; category: string }[] = [
  { url: 'https://thehackernews.com/feeds/posts/default', category: 'Phishing' },
  { url: 'https://krebsonsecurity.com/feed/', category: 'Cyber Crime' },
  { url: 'https://www.bleepingcomputer.com/feed/', category: 'Online Safety' },
  { url: 'https://socialcatfish.com/scamfish/feed/', category: 'Social Media Scams' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanRssContent(html: string): string {
  return html
    .replace(/<div class=['"]yarpp[\s\S]*?<\/div>/gi, '')
    .replace(/<div id=['"]yarpp[\s\S]*?<\/div>/gi, '')
    .replace(/<h3>Related posts:<\/h3>\s*<ol>[\s\S]*?<\/ol>/gi, '')
    .replace(/The post <a[\s\S]*?appeared first on <a[\s\S]*?<\/a>\./gi, '')
    .replace(/from <a[\s\S]*?<\/a>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
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
    const plainText = stripHtml(cleanedHtml);
    const excerpt = plainText.substring(0, 500);
    const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
    const coverImage = item.enclosure?.url || item['media:thumbnail']?.$.url || '';

    try {
      await BlogPost.findOneAndUpdate(
        { slug },
        {
          title: title.substring(0, 200),
          slug,
          excerpt: excerpt || 'No excerpt available.',
          content: cleanedHtml || plainText || '',
          coverImage,
          category: 'Scam Alert',
          tags: [feed.category],
          author: 'TrustLens Security Team',
          isPublished: true,
          publishedAt: pubDate,
          seo: {
            metaTitle: title.substring(0, 60),
            metaDescription: excerpt.substring(0, 160),
            canonicalUrl: item.link || '',
          },
        },
        { upsert: true, new: true },
      );
      logger.info({ title, slug }, 'Upserted blog post from RSS');
    } catch (err: any) {
      logger.warn({ err, title }, 'Failed to upsert blog post from RSS');
    }
  }
}

export function startScamAlertCron(): void {
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Running scam alert RSS cron');
    for (const feed of FEEDS) {
      await processFeed(feed);
    }
  });

  logger.info('Scam alert cron scheduled (every 6 hours)');
}
