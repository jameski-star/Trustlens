import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const PUBLIC = resolve(__dirname, '..', 'public');

const SITE = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.trustlens.website';
const API = process.env.API_URL || (process.env.VITE_API_URL || `${SITE}/api/v1`);

const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_URLS = [
  { loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE}/url-checker`, priority: '0.9', changefreq: 'monthly' },
  { loc: `${SITE}/email-checker`, priority: '0.9', changefreq: 'monthly' },
  { loc: `${SITE}/sms-checker`, priority: '0.9', changefreq: 'monthly' },
  { loc: `${SITE}/screenshot-scanner`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE}/qr-scanner`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE}/scam-alerts`, priority: '0.9', changefreq: 'daily' },
  { loc: `${SITE}/trending-scams`, priority: '0.8', changefreq: 'daily' },
  { loc: `${SITE}/community-reports`, priority: '0.8', changefreq: 'daily' },
  { loc: `${SITE}/blog`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${SITE}/knowledge-center`, priority: '0.7', changefreq: 'weekly' },
  { loc: `${SITE}/about`, priority: '0.6', changefreq: 'monthly' },
  { loc: `${SITE}/faq`, priority: '0.6', changefreq: 'monthly' },
  { loc: `${SITE}/contact`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${SITE}/privacy`, priority: '0.4', changefreq: 'yearly' },
  { loc: `${SITE}/terms`, priority: '0.4', changefreq: 'yearly' },
  { loc: `${SITE}/api-docs`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${SITE}/status`, priority: '0.4', changefreq: 'weekly' },
  { loc: `${SITE}/login`, priority: '0.3', changefreq: 'monthly' },
  { loc: `${SITE}/register`, priority: '0.3', changefreq: 'monthly' },
];

function xmlUrl(loc, { lastmod, changefreq, priority } = {}) {
  let s = `  <url>\n    <loc>${loc}</loc>\n`;
  if (lastmod) s += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) s += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) s += `    <priority>${priority}</priority>\n`;
  s += `  </url>`;
  return s;
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function lastmod(item) {
  const d = item.updatedAt || item.publishedAt || item.createdAt;
  return d ? d.slice(0, 10) : TODAY;
}

async function generate() {
  const entries = STATIC_URLS.map(u =>
    xmlUrl(u.loc, { lastmod: TODAY, changefreq: u.changefreq, priority: u.priority })
  );

  const [blogData, kaData, repData] = await Promise.all([
    fetchJson(`${API}/blog?limit=1000`),
    fetchJson(`${API}/knowledge`),
    fetchJson(`${API}/community?limit=1000&status=published`),
  ]);

  const posts = blogData?.data?.items ?? [];
  for (const post of posts) {
    if (post.slug) {
      entries.push(xmlUrl(`${SITE}/blog/${post.slug}`, { lastmod: lastmod(post), changefreq: 'monthly', priority: '0.6' }));
    }
  }

  const articles = kaData?.data?.items ?? [];
  for (const art of articles) {
    if (art.slug) {
      entries.push(xmlUrl(`${SITE}/knowledge-center/${art.slug}`, { lastmod: lastmod(art), changefreq: 'monthly', priority: '0.6' }));
    }
  }

  const reports = repData?.data?.reports ?? [];
  for (const rep of reports) {
    const slug = rep.slug || rep._id;
    if (slug) {
      entries.push(xmlUrl(`${SITE}/community-reports/${slug}`, { lastmod: lastmod(rep), changefreq: 'weekly', priority: '0.5' }));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n\n')}
</urlset>
`;

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login
Disallow: /register
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`;

  const targets = [DIST, PUBLIC];
  for (const dir of targets) {
    try { mkdirSync(dir, { recursive: true }); } catch {}
    writeFileSync(resolve(dir, 'sitemap.xml'), xml, 'utf-8');
    writeFileSync(resolve(dir, 'robots.txt'), robotsTxt, 'utf-8');
  }

  const dynCount = entries.length - STATIC_URLS.length;
  console.log(`Generated sitemap.xml with ${entries.length} URLs (${STATIC_URLS.length} static + ${dynCount} dynamic)`);
  console.log(`Generated robots.txt pointing to ${SITE}/sitemap.xml`);
}

generate().catch(err => {
  console.error('Sitemap generation failed:', err.message);
  process.exit(0);
});