import mongoose from 'mongoose';
import { config } from './config';
import RssParser from 'rss-parser';
import { BlogPost } from './models/BlogPost';
import { logger } from './utils/logger';

const parser = new RssParser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; TrustLensBot/1.0; +https://trustlens.website)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  timeout: 10000,
});

const FEEDS: { url: string; category: string }[] = [
  { url: 'https://thehackernews.com/feeds/posts/default', category: 'Phishing' },
  { url: 'https://www.bleepingcomputer.com/feed/', category: 'Online Safety' },
  { url: 'https://krebsonsecurity.com/feed/', category: 'Cyber Crime' },
  { url: 'https://socialcatfish.com/scamfish/feed/', category: 'Social Media Scams' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

async function processFeed(feed: { url: string; category: string }): Promise<number> {
  let feedResult;
  try {
    feedResult = await parser.parseURL(feed.url);
  } catch (err) {
    logger.warn({ err, url: feed.url }, 'Failed to fetch RSS feed');
    return 0;
  }

  if (!feedResult.items?.length) return 0;

  let count = 0;
  for (const item of feedResult.items) {
    const title = item.title?.trim();
    if (!title) continue;

    const slug = slugify(title);
    const exists = await BlogPost.findOne({ slug });
    if (exists) continue;

    const excerpt = (item.contentSnippet || item.content || '').substring(0, 500);
    const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
    const coverImage = item.enclosure?.url || item['media:thumbnail']?.$.url || '';

    try {
      await BlogPost.create({
        title: title.substring(0, 200),
        slug,
        excerpt: excerpt || 'No excerpt available.',
        content: item.content || item.contentSnippet || excerpt || '',
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
      });
      count++;
    } catch (err: any) {
      if (err?.code !== 11000) {
        logger.warn({ err, title }, 'Failed to create blog post from RSS');
      }
    }
  }
  return count;
}

async function run() {
  await mongoose.connect(config.mongodbUri);
  logger.info('Running one-off RSS fetch...');
  for (const feed of FEEDS) {
    const count = await processFeed(feed);
    logger.info({ url: feed.url, count }, 'Feed processed');
  }
  await mongoose.disconnect();
  logger.info('Done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
