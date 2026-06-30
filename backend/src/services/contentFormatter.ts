const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid',
  'msclkid', 'twclid', 'sc_campaign', 'sc_channel', 'sc_content',
  'sc_medium', 'sc_outcome', 'sc_geo', 'sc_country',
  'ref', 'source', 'si', 's_kwcid',
];

const AD_SELECTORS = [
  '.advertisement', '.ad-container', '.ad-wrapper', '.ad-slot',
  '.sponsored-content', '.promoted', '.paid-content',
  '[class*="ad-"]', '[class*="ads-"]', '[class*="sponsored"]',
  '[id*="ad-"]', '[id*="ads-"]',
  '.google-ads', '.dfp-tag', '.carbonads', '.buysellads',
  '.shareaholic', '.addthis',
];

const AD_KEYWORDS = [
  'advertisement', 'sponsored', 'promoted', 'paid content',
  'brought to you by', 'ad', 'ads by',
];

export function cleanTrackingParams(url: string): string {
  try {
    const parsed = new URL(url);
    const removable = new Set(TRACKING_PARAMS);
    for (const [key] of parsed.searchParams) {
      if (removable.has(key)) {
        parsed.searchParams.delete(key);
      }
    }
    if (parsed.searchParams.toString() === '' && url.includes('?')) {
      parsed.search = '';
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function isAdContent(text: string): boolean {
  const lower = text.toLowerCase();
  return AD_KEYWORDS.some(keyword => lower.includes(keyword));
}

export function cleanScrapedContent(text: string): string {
  let cleaned = text;

  cleaned = cleaned
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  for (const selector of AD_SELECTORS) {
    try {
      const attrMatch = selector.match(/\[(class|id)\*="([^"]+)"\]/);
      if (attrMatch) {
        const attr = attrMatch[1];
        const val = attrMatch[2];
        const regex = new RegExp(`<[^>]*${attr}=["'][^"']*${val}[^"']*["'][^>]*>[\\s\\S]*?<\\/[^>]+>`, 'gi');
        cleaned = cleaned.replace(regex, '');
      }
    } catch {
    }
  }

  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  cleaned = cleaned.trim();

  return cleaned;
}

export function cleanContentTags($: any, $cheerio: any): void {
  const adClasses = [
    '.advertisement', '.ad-container', '.ad-wrapper', '.ad-slot',
    '.sponsored-content', '.promoted', '.paid-content',
    '.google-ads', '.dfp-tag', '.shareaholic', '.addthis',
    '.sharedaddy', '#jp-post-flair', '.yarpp-related', '.rp4wp-related',
  ];

  for (const cls of adClasses) {
    try {
      $(cls).remove();
    } catch {
    }
  }

  $('[class*="ad-"], [class*="ads-"], [class*="sponsored"], [class*="promoted"]').remove();
  $('[id*="ad-"], [id*="ads-"]').remove();

  $('iframe').each((_: number, el: any) => {
    const src = $(el).attr('src') || '';
    if (isAdIframe(src)) {
      $(el).remove();
    }
  });
}

function isAdIframe(src: string): boolean {
  const adIframePatterns = [
    'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
    'adservice.google.com', 'adsrvr.org', 'adnxs.com',
    'criteo.com', 'criteo.net', 'outbrain.com', 'taboola.com',
  ];
  return adIframePatterns.some(pattern => src.includes(pattern));
}

export function extractMainContent(html: string): string {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (articleMatch) return articleMatch[0];

  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (mainMatch) return mainMatch[0];

  const contentMatch = html.match(/<div[^>]*(?:id|class)=["'](?:content|post|article|entry|main)["'][^>]*>[\s\S]*?<\/div>/i);
  if (contentMatch) return contentMatch[0];

  const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i);
  return bodyMatch ? bodyMatch[0] : html;
}
