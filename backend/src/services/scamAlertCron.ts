import cron from 'node-cron';
import RssParser from 'rss-parser';
import { BlogPost } from '../models/BlogPost';
import { logger } from '../utils/logger';

const parser = new RssParser();

const FEEDS: { url: string; category: string }[] = [
  { url: 'https://feeds.feedburner.com/TheHackerNews', category: 'Phishing' },
  { url: 'https://krebsonsecurity.com/feed/', category: 'Online Safety' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
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
    const exists = await BlogPost.findOne({ slug });
    if (exists) continue;

    const excerpt = (item.contentSnippet || item.content || '').substring(0, 500);
    const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

    try {
      await BlogPost.create({
        title: title.substring(0, 200),
        slug,
        excerpt: excerpt || 'No excerpt available.',
        content: item.content || item.contentSnippet || excerpt || '',
        coverImage: '',
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
      });
      logger.info({ title, slug }, 'Auto-created blog post from RSS');
    } catch (err: any) {
      if (err?.code !== 11000) {
        logger.warn({ err, title }, 'Failed to create blog post from RSS');
      }
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
