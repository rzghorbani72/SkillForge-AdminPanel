import { NextRequest, NextResponse } from 'next/server';
import {
  getAllowedPanelHosts,
  isClusterOrLoopbackHost,
  isHostAllowed,
  isHostUnderMentomaDomains,
  normalizeHostname
} from './config';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** External webhooks — no browser Origin header. */
const CSRF_ORIGIN_SKIP_PREFIXES = ['/payment/saman-callback'] as const;

const RATE_LIMIT_RULES: Array<{
  prefix: string;
  limit: number;
  windowMs: number;
}> = [
  { prefix: '/api/payment/', limit: 20, windowMs: 60_000 },
  { prefix: '/api/geolocation', limit: 30, windowMs: 60_000 },
  { prefix: '/api/', limit: 120, windowMs: 60_000 }
];

type RateBucket = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateBucket>();

function getRequestOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  if (origin) return origin;

  const referer = request.headers.get('referer');
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function isTrustedOrigin(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'https:' && protocol !== 'http:') return false;

    if (process.env.NODE_ENV === 'production' && protocol !== 'https:') {
      return false;
    }

    return (
      isHostAllowed(hostname, getAllowedPanelHosts()) ||
      isHostUnderMentomaDomains(hostname)
    );
  } catch {
    return false;
  }
}

function shouldSkipOriginCsrf(pathname: string): boolean {
  return CSRF_ORIGIN_SKIP_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function enforceTrustedHost(request: NextRequest): NextResponse | null {
  const host = request.headers.get('host');
  if (!host) return null;

  if (process.env.NODE_ENV !== 'production') return null;

  const hostname = normalizeHostname(host);
  if (
    isClusterOrLoopbackHost(hostname) ||
    isHostAllowed(hostname, getAllowedPanelHosts()) ||
    isHostUnderMentomaDomains(hostname)
  ) {
    return null;
  }

  return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
}

export function enforceApiOriginCsrf(
  request: NextRequest
): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api/')) return null;
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) return null;
  if (shouldSkipOriginCsrf(pathname)) return null;

  const origin = getRequestOrigin(request);
  if (!origin || !isTrustedOrigin(origin)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  return null;
}

export function enforceApiRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api/')) return null;

  const rule =
    RATE_LIMIT_RULES.find((entry) => pathname.startsWith(entry.prefix)) ??
    RATE_LIMIT_RULES[RATE_LIMIT_RULES.length - 1];

  const ip = getClientIp(request);
  const key = `${ip}:${rule.prefix}`;
  const allowed = checkRateLimit(key, rule.limit, rule.windowMs);

  if (allowed) return null;

  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
