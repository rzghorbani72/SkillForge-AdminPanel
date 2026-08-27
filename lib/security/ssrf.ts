import { stripTrailingSlash, resolveBackendRewriteTarget } from '../api-config';
import {
  getAllowedBackendHosts,
  isHostAllowed,
  normalizeHostname
} from './config';

const BLOCKED_BACKEND_PATH_RE = /^\/\/|\\|@|:|%2f|%5c|\.\.(\/|%2f|%5c)/i;

export function assertSafeBackendPath(path: string): void {
  const normalized = path.trim();
  if (!normalized.startsWith('/')) {
    throw new Error('Backend path must start with /');
  }
  if (BLOCKED_BACKEND_PATH_RE.test(normalized)) {
    throw new Error('Unsafe backend path');
  }
}

function parseUrlOrThrow(raw: string): URL {
  try {
    return new URL(raw);
  } catch {
    throw new Error('Invalid backend URL');
  }
}

export function assertAllowedBackendOrigin(url: string): URL {
  const parsed = parseUrlOrThrow(url);
  const hostname = normalizeHostname(parsed.hostname);

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Backend URL must use http or https');
  }

  if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
    throw new Error('Production backend URL must use https');
  }

  if (!isHostAllowed(hostname, getAllowedBackendHosts())) {
    throw new Error(`Backend host not allowed: ${hostname}`);
  }

  return parsed;
}

export function resolveTrustedBackendBaseUrl(): string {
  const raw = stripTrailingSlash(
    process.env.INTERNAL_API_URL ??
      process.env.BACKEND_API_URL ??
      process.env.NEXT_PUBLIC_BACKEND_API_URL ??
      ''
  );

  const candidate = raw.startsWith('http')
    ? raw
    : resolveBackendRewriteTarget(raw || null);

  const parsed = assertAllowedBackendOrigin(candidate);
  return stripTrailingSlash(parsed.toString());
}

export function buildTrustedBackendUrl(path: string): string {
  assertSafeBackendPath(path);
  const base = resolveTrustedBackendBaseUrl();
  return `${base}${path}`;
}

/** Server-to-server backend calls (payment verify, etc.). */
export function buildInternalBackendHeaders(
  extra?: Record<string, string | undefined>
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const key = process.env.INTERNAL_API_KEY;
  if (key) headers['x-api-key'] = key;
  if (extra) {
    for (const [name, value] of Object.entries(extra)) {
      if (value !== undefined) headers[name] = value;
    }
  }
  return headers;
}

export function assertAllowedBackendRewriteTarget(url: string): string {
  const target = stripTrailingSlash(url);
  const withProtocol = target.startsWith('http') ? target : `https://${target}`;
  assertAllowedBackendOrigin(withProtocol);
  return stripTrailingSlash(withProtocol);
}

export function assertAllowedExternalFetchUrl(
  url: string,
  allowedHosts: readonly string[]
): URL {
  const parsed = parseUrlOrThrow(url);

  if (parsed.protocol !== 'https:') {
    throw new Error('External fetch must use https');
  }

  if (!isHostAllowed(normalizeHostname(parsed.hostname), allowedHosts)) {
    throw new Error(`External host not allowed: ${parsed.hostname}`);
  }

  return parsed;
}
