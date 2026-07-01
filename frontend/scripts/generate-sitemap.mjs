import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const PUBLIC = resolve(__dirname, '..', 'public');

const SITE = process.env.SITE_URL || 'https://trustlens.app';
const API = process.env.API_URL || (process.env.VITE_API_URL || 'http://localhost:5000/api/v1');

async function fetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function xmlUrl(loc, { lastmod, changefreq, priority } = {}) {
  let s = `  <url>\n    <loc>${loc}</loc>\n`;
  if (lastmod) s += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) s += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) s += `    <priority>${priority}</priority>\n`;
  s += `  </url>`;
  return s;
}

async function generate() {
  const entries = [];

  // Fetch blog posts
  const blogData = await fetchJson(`${API}/blog?limit=1000`);
  const posts = blogData?.data?.items ?? [];
  for (const post of posts) {
    const pub = post.publishedAt || post.updatedAt || post.createdAt;
    const d = pub ? pub.slice(0, 10) : new Date().toISOString().slice(0, 10);
    entries.push(xmlUrl(`${SITE}/blog/${post.slug}`, { lastmod: d, changefreq: 'monthly', priority: '0.6' }));
  }

  // Fetch knowledge articles
  const kaData = await fetchJson(`${API}/knowledge`);
  const articles = kaData?.data?.items ?? [];
  for (const art of articles) {
    const mod = art.updatedAt || art.createdAt;
    const d = mod ? mod.slice(0, 10) : new Date().toISOString().slice(0, 10);
    entries.push(xmlUrl(`${SITE}/knowledge-center/${art.slug}`, { lastmod: d, changefreq: 'monthly', priority: '0.6' }));
  }

  // Fetch community reports (published + scam alerts)
  const repData = await fetchJson(`${API}/community?limit=1000&status=published`);
  const reports = repData?.data?.reports ?? [];
  for (const rep of reports) {
    const mod = rep.updatedAt || rep.createdAt;
    const d = mod ? mod.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const slug = rep.slug || rep._id;
    entries.push(xmlUrl(`${SITE}/community-reports/${slug}`, { lastmod: d, changefreq: 'weekly', priority: '0.5' }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n\n')}\n</urlset>\n`;

  // Write to both dist (for build output) and public (for dev)
  const targets = [DIST, PUBLIC];
  for (const dir of targets) {
    try { mkdirSync(dir, { recursive: true }); } catch {}
    writeFileSync(resolve(dir, 'sitemap-dynamic.xml'), xml, 'utf-8');
  }

  console.log(`Generated sitemap-dynamic.xml with ${entries.length} dynamic URLs`);
}

generate().catch(err => {
  console.error('Sitemap generation failed:', err.message);
  process.exit(0); // don't fail the build
});
