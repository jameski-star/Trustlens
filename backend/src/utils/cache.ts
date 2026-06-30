const store = new Map<string, { value: unknown; expires: number }>();

const DEFAULT_TTL_MS = 60_000;
const CLEANUP_INTERVAL_MS = 120_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now > v.expires) store.delete(k);
    }
  }, CLEANUP_INTERVAL_MS);
  if (typeof cleanupTimer === 'object' && typeof (cleanupTimer as unknown as { unref?: () => void }).unref === 'function') {
    (cleanupTimer as unknown as { unref: () => void }).unref();
  }
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
  store.set(key, { value, expires: Date.now() + ttlMs });
  if (store.size > 2000) {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now > v.expires) store.delete(k);
      if (store.size <= 1500) break;
    }
  }
}

export function cacheWrap<T>(key: string, fn: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const existing = cacheGet<T>(key);
  if (existing !== undefined) return Promise.resolve(existing);
  return fn().then((result) => {
    cacheSet(key, result, ttlMs);
    return result;
  });
}
