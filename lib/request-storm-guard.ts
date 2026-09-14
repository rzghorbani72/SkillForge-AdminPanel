/**
 * Client-side circuit breaker for one route being hammered (render loop,
 * runaway retry, or a hostile script). Kept semantically identical in
 * AdminPanel and edusphere.
 */
export const STORM_WINDOW_MS = 10_000;
export const STORM_MAX_HITS_PER_ROUTE = 30;

export type StormVerdict =
  | { readonly tripped: false }
  | { readonly tripped: true; readonly count: number };

const hitsByKey = new Map<string, number[]>();

export function routeKey(method: string, path: string): string {
  const pathname = path.split('?')[0] ?? path;
  return `${method.toUpperCase()} ${pathname}`;
}

/** Sliding-window counter for any key (a route, an IP, …). */
export function trackKey(
  key: string,
  maxHits: number,
  windowMs: number,
  now = Date.now(),
): StormVerdict {
  const recent = (hitsByKey.get(key) ?? []).filter((ts) => now - ts < windowMs);
  recent.push(now);
  if (recent.length > maxHits) recent.shift();
  hitsByKey.set(key, recent);

  return recent.length >= maxHits ? { tripped: true, count: recent.length } : { tripped: false };
}

export function trackRoute(method: string, path: string, now = Date.now()): StormVerdict {
  return trackKey(routeKey(method, path), STORM_MAX_HITS_PER_ROUTE, STORM_WINDOW_MS, now);
}

export function resetStormGuard(): void {
  hitsByKey.clear();
}
