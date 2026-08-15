import { getBrowserApiBaseUrl } from './api-base-url';

function readDocumentCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )csrf-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

let inflight: Promise<string | null> | null = null;

/**
 * Make sure the browser has a readable csrf-token cookie before a write.
 * Fresh / incognito tabs call GET /auth/csrf once; parallel callers share one
 * in-flight request so they do not rotate the cookie against each other.
 */
export async function ensureCsrfToken(force = false): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if (!force) {
    const existing = readDocumentCsrfToken();
    if (existing) return existing;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const response = await fetch(`${getBrowserApiBaseUrl()}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        return readDocumentCsrfToken();
      }

      const data: unknown = await response.json().catch(() => null);
      if (
        data &&
        typeof data === 'object' &&
        'csrf_token' in data &&
        typeof (data as { csrf_token: unknown }).csrf_token === 'string'
      ) {
        return (data as { csrf_token: string }).csrf_token;
      }

      return readDocumentCsrfToken();
    } catch {
      return readDocumentCsrfToken();
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function isCsrfRequiredError(data: unknown, status: number): boolean {
  if (status !== 403 || !data || typeof data !== 'object') return false;
  const payload = data as Record<string, unknown>;
  if (payload.code === 'CSRF_REQUIRED') return true;
  const nested = payload.message;
  if (nested && typeof nested === 'object' && nested !== null) {
    return (nested as Record<string, unknown>).code === 'CSRF_REQUIRED';
  }
  return false;
}
