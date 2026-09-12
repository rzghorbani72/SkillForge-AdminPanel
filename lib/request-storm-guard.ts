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

const hitsByRoute = new Map<string, number[]>();

export function routeKey(method: string, path: string): string {
  const pathname = path.split('?')[0] ?? path;
  return `${method.toUpperCase()} ${pathname}`;
}

export function trackRoute(
  method: string,
  path: string,
  now = Date.now()
): StormVerdict {
  const key = routeKey(method, path);
  const recent = (hitsByRoute.get(key) ?? []).filter(
    (ts) => now - ts < STORM_WINDOW_MS
  );
  recent.push(now);
  if (recent.length > STORM_MAX_HITS_PER_ROUTE) recent.shift();
  hitsByRoute.set(key, recent);

  return recent.length >= STORM_MAX_HITS_PER_ROUTE
    ? { tripped: true, count: recent.length }
    : { tripped: false };
}

export function resetStormGuard(): void {
  hitsByRoute.clear();
}
