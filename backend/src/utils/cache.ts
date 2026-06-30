const store = new Map<string, { value: unknown; expires: number }>();

const DEFAULT_TTL_MS = 60_000;
const CLEANUP_INTERVAL_MS = 120_000;
const MAX_CACHE_SIZE = 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now > v.expires) store.delete(k);
    }
    if (store.size > MAX_CACHE_SIZE) {
      const sorted = [...store.entries()].sort((a, b) => a[1].expires - b[1].expires);
      const toDelete = sorted.slice(0, sorted.length - MAX_CACHE_SIZE);
      for (const [k] of toDelete) store.delete(k);
    }
  }, CLEANUP_INTERVAL_MS);
}

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  startCleanup();
  if (store.size >= MAX_CACHE_SIZE) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) store.delete(oldestKey);
  }
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheWrap<T>(key: string, fn: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const existing = cacheGet<T>(key);
  if (existing !== undefined) return Promise.resolve(existing);
  return fn().then((result) => {
    cacheSet(key, result, ttlMs);
    return result;
  });
}
