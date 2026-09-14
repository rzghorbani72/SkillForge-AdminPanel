import {
  API_VERSION_PATH,
  isLegacyApiPath,
  resolveBackendRewriteTarget,
  stripTrailingSlash,
} from './api-config';
import { langApiVersionPath } from './api-lang';
import { DEFAULT_LANGUAGE } from './i18n/config';
import { resolveTrustedBackendBaseUrl } from './security/ssrf';

function readPreferredLanguage(): string {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('preferred_language') || DEFAULT_LANGUAGE;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Browser calls use a same-origin path (/fa/v1) so HttpOnly auth cookies are set on the panel host.
 * Server components/actions use an absolute backend URL (rewrite target or direct API).
 */
export function getBrowserApiBaseUrl(lang?: string | null): string {
  const versionPath = langApiVersionPath(lang ?? readPreferredLanguage());
  const raw = stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? '') || versionPath;

  if (process.env.NODE_ENV === 'development') {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw.replace(/\/v1\/?$/, versionPath);
    }
    return versionPath;
  }

  if (raw.startsWith('http://') || raw.startsWith('https://') || isLegacyApiPath(raw)) {
    return versionPath;
  }

  if (raw === API_VERSION_PATH || raw.endsWith('/v1')) {
    return versionPath;
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function getServerApiBaseUrl(lang?: string | null): string {
  const base = resolveTrustedBackendBaseUrl();
  const versionPath = langApiVersionPath(lang ?? DEFAULT_LANGUAGE);
  return base.replace(/\/v1\/?$/, versionPath);
}

export function getBackendRewriteTarget(): string {
  return resolveBackendRewriteTarget(
    process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL,
  );
}

export {
  API_VERSION_PATH,
  browserApiPath,
  LEGACY_API_PATH,
  API_PRODUCTION_DEFAULTS,
} from './api-config';

export { normalizeApiLang, langApiVersionPath } from './api-lang';
