/**
 * Browser calls use a same-origin path (/api) so HttpOnly auth cookies are set on the panel host.
 * Server components/actions use an absolute backend URL (rewrite target or direct API).
 */
const DEFAULT_BROWSER_API = '/api';
const DEFAULT_SERVER_API = 'http://localhost:3000/api';

export function getBrowserApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || DEFAULT_BROWSER_API;
  // Absolute URLs break same-origin cookies; Next.js rewrites /api to the backend.
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return DEFAULT_BROWSER_API;
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function getServerApiBaseUrl(): string {
  const internal =
    process.env.INTERNAL_API_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, '');
  if (internal?.startsWith('http')) {
    return internal;
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (publicUrl?.startsWith('http')) {
    return publicUrl;
  }

  const host = (
    process.env.NEXT_PUBLIC_HOST ||
    process.env.VERCEL_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
  const origin = host.startsWith('http') ? host : `https://${host}`;
  const path = publicUrl?.startsWith('/') ? publicUrl : DEFAULT_BROWSER_API;
  return `${origin}${path}`;
}

export function getBackendRewriteTarget(): string {
  const target =
    process.env.BACKEND_API_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, '') ||
    'https://api-academy.darkube.ir/api';
  return target.startsWith('http') ? target : `https://${target}`;
}
