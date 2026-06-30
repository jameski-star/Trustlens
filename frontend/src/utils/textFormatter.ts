const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,;:!?)])(?=[\s<.,;:!?)]|$)/gi;

const AD_PATTERNS = [
  /(?:advertisement|sponsored|promoted|paid\s*content|brought\s*to\s*you\s*by)/gi,
  /(?:click\s*here\s*to\s*buy|buy\s*now|shop\s*now|limited\s*time\s*offer)/gi,
  /(?:sign\s*up\s*now|subscribe\s*now|get\s*started\s*today)/gi,
  /(?:call\s*now|act\s*now|don't\s*mis\s*s\s*out)/gi,
];

const MISSING_SPACE_REGEX = /([a-z])([A-Z])/g;

const HEADING_REGEX = /^([A-Z][^.]{3,60})$/;

export function formatLinks(text: string): string {
  return text.replace(URL_REGEX, (url) => {
    const display = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-formatter-link">${display}</a>`;
  });
}

export function stripAds(text: string): string {
  let cleaned = text;
  for (const pattern of AD_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

export function fixBrokenWords(text: string): string {
  return text.replace(MISSING_SPACE_REGEX, '$1 $2');
}

export function autoDetectHeadings(text: string): string {
  return text.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed && HEADING_REGEX.test(trimmed)) {
      const level = trimmed.length < 25 ? 'h3' : 'h4';
      return `<${level} class="text-formatter-heading">${trimmed}</${level}>`;
    }
    return line;
  }).join('\n');
}

export function wordSafeTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace === -1) return truncated + '...';
  return truncated.substring(0, lastSpace) + '...';
}

export function formatText(text: string): string {
  if (!text) return '';
  let result = text;
  result = stripAds(result);
  result = fixBrokenWords(result);
  result = formatLinks(result);
  result = autoDetectHeadings(result);
  result = result.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<a ')) return line;
    return `<p class="text-formatter-paragraph">${trimmed}</p>`;
  }).join('\n');
  return result;
}

export function formatTextInline(text: string): string {
  if (!text) return '';
  let result = text;
  result = stripAds(result);
  result = fixBrokenWords(result);
  result = formatLinks(result);
  return result;
}
