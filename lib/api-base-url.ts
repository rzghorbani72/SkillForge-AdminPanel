import {
  API_DEVELOPMENT_DEFAULTS,
  API_VERSION_PATH,
  isLegacyApiPath,
  resolveBackendRewriteTarget,
  stripTrailingSlash
} from './api-config';

/**
 * Browser calls use a same-origin path (/v1) so HttpOnly auth cookies are set on the panel host.
 * Server components/actions use an absolute backend URL (rewrite target or direct API).
 */
export function getBrowserApiBaseUrl(): string {
  const raw =
    stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? '') ||
    API_VERSION_PATH;

  if (process.env.NODE_ENV === 'development') {
    return raw;
  }

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    isLegacyApiPath(raw)
  ) {
    return API_VERSION_PATH;
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function getServerApiBaseUrl(): string {
  const internal =
    stripTrailingSlash(process.env.INTERNAL_API_URL ?? '') ||
    stripTrailingSlash(process.env.BACKEND_API_URL ?? '') ||
    stripTrailingSlash(process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '');

  if (internal.startsWith('http')) {
    return internal;
  }

  const publicUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? '');
  if (publicUrl.startsWith('http')) {
    return publicUrl;
  }

  const host = stripTrailingSlash(
    process.env.NEXT_PUBLIC_HOST ||
      process.env.VERCEL_URL ||
      API_DEVELOPMENT_DEFAULTS.backendOrigin
  );
  const origin = host.startsWith('http') ? host : `https://${host}`;
  const path = publicUrl.startsWith('/') ? publicUrl : API_VERSION_PATH;
  return `${origin}${path}`;
}

export function getBackendRewriteTarget(): string {
  return resolveBackendRewriteTarget(
    process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL
  );
}

export {
  API_VERSION_PATH,
  browserApiPath,
  LEGACY_API_PATH,
  API_PRODUCTION_DEFAULTS
} from './api-config';
