/**
 * Single source of truth for AdminPanel API URLs and path prefixes.
 * Import from here — do not hardcode /v1 or /api elsewhere.
 */
export const API_VERSION_PATH = '/v1' as const;
export const LEGACY_API_PATH = '/api' as const;

export const API_PRODUCTION_DEFAULTS = {
  browserApiUrl: API_VERSION_PATH,
  backendApiUrl: 'https://api.mentoma.ir/v1',
  backendOrigin: 'https://api.mentoma.ir',
  panelHost: 'https://admin.mentoma.ir'
} as const;

export const API_DEVELOPMENT_DEFAULTS = {
  backendOrigin: 'http://localhost:3000',
  browserApiUrl: `http://localhost:3000${API_VERSION_PATH}`
} as const;

export const API_REWRITE_SOURCES = {
  current: `${API_VERSION_PATH}/:path*`,
  /** /fa/v1/... or /en/v1/... — lang segment is forwarded to the backend */
  langPrefixed: `/:lang/${API_VERSION_PATH.slice(1)}/:path*`,
  legacy: `${LEGACY_API_PATH}/:path*`
} as const;

export function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

export function isLegacyApiPath(value: string): boolean {
  return value === LEGACY_API_PATH || value.endsWith(LEGACY_API_PATH);
}

/** Same-origin browser path under the versioned API prefix, e.g. /v1/images/... */
export function browserApiPath(segment: string): string {
  const normalized = segment.startsWith('/') ? segment : `/${segment}`;
  return `${API_VERSION_PATH}${normalized}`;
}

export function resolveBackendRewriteTarget(
  backendApiUrl?: string | null
): string {
  const target =
    stripTrailingSlash(backendApiUrl ?? '') ||
    API_PRODUCTION_DEFAULTS.backendApiUrl;
  return target.startsWith('http') ? target : `https://${target}`;
}
