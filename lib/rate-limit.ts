/**
 * Small in-memory sliding-window rate limiter.
 *
 * This is the first, cheap line of defence and only covers a single server
 * instance. The authoritative limits live in the database (see
 * `public.submit_feedback`), which works across every instance.
 */
export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}) {
  const hits = new Map<string, number[]>();

  return {
    check(key: string, now = Date.now()): { allowed: boolean; retryAfterMs: number } {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfterMs: windowMs - (now - recent[0]) };
      }

      recent.push(now);
      // Map preserves insertion order: re-inserting moves the key to the end,
      // so the first key is always the least recently used one.
      hits.delete(key);
      hits.set(key, recent);
      if (hits.size > maxKeys) hits.delete(hits.keys().next().value!);

      return { allowed: true, retryAfterMs: 0 };
    },
    reset() {
      hits.clear();
    },
  };
}
