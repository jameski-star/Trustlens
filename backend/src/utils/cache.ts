const store = new Map<string, { value: unknown; expires: number }>();

const DEFAULT_TTL_MS = 60_000;

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
  store.set(key, { value, expires: Date.now() + ttlMs });
  if (store.size > 5000) {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now > v.expires) store.delete(k);
      if (store.size <= 4000) break;
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
