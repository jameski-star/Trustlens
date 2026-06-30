const CACHE_KEY = 'trustlens-scan-cache';
const MAX_ENTRIES = 5;

interface CacheEntry {
  input: string;
  type: string;
  report: unknown;
  timestamp: number;
}

export function getCachedResult(input: string, type: string): unknown | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entries: CacheEntry[] = JSON.parse(raw);
    const entry = entries.find(e => e.input === input && e.type === type);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > 300_000) {
      const updated = entries.filter(e => e !== entry);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return null;
    }
    return entry.report;
  } catch {
    return null;
  }
}

export function setCachedResult(input: string, type: string, report: unknown): void {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const entries: CacheEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = entries.filter(e => e.input !== input || e.type !== type);
    filtered.unshift({ input, type, report, timestamp: Date.now() });
    localStorage.setItem(CACHE_KEY, JSON.stringify(filtered.slice(0, MAX_ENTRIES)));
  } catch { /* storage full or unavailable */ }
}

export function getRecentScans(): { input: string; type: string; timestamp: number }[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const entries: CacheEntry[] = JSON.parse(raw);
    return entries.map(e => ({ input: e.input, type: e.type, timestamp: e.timestamp }));
  } catch {
    return [];
  }
}
