import { User as UserType } from '@/types/api';
import { toast } from 'react-toastify';
import { getBrowserApiBaseUrl } from '../api-base-url';
import { csrfHeader, selectedAcademyHeader } from '../browser-request-headers';
import { ensureCsrfToken, isCsrfRequiredError } from '../csrf';
import { ApiResponseError, parseApiError, resolveApiErrorMessage } from '../api-error';
import { currentLanguage } from '../current-language';
import { isAuthPagePath } from '../auth-routes';
import { isPanelAccessBlockedError } from '../auth-login-errors';
import {
  createSellerIdentityIncompleteError,
  SELLER_IDENTITY_INCOMPLETE,
} from '../seller-identity-error';
import type { SellerIdentityField } from '@/types/seller-identity';
import { trackRoute } from '../request-storm-guard';
import {
  createKycIncompleteError,
  KYC_IDENTITY_PATH,
  KYC_INCOMPLETE,
  KYC_PROFILE_PATH,
  parseKycMissingFields,
} from '../kyc-error';
import type { ApiResponse, LegalConsentRequiredDetail } from './types-1';
import { RequestGate } from './request-gate';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export class HttpClient extends RequestGate {
  protected isRefreshing: boolean = false;

  protected refreshPromise: Promise<boolean> | null = null;

  /** Shared in-flight /auth/me so parallel mounts ask the session question once. */
  protected currentUserRequest: Promise<UserType | null> | null = null;

  /** Resolve base URL per request so language switches apply immediately. */
  protected get baseURL(): string {
    return getBrowserApiBaseUrl();
  }

  /**
   * Attempt to refresh the access token using the refresh token cookie
   * Returns true if refresh was successful, false otherwise
   */
  protected async refreshToken(): Promise<boolean> {
    // If already refreshing, wait for the existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          logger.ok('Auth', 'TokenRefreshed');
          return true;
        }

        logger.warn('Auth', 'TokenRefreshRejected', { status_code: response.status });
        return false;
      } catch (error) {
        logger.error('Auth', 'TokenRefreshFailed', errorFields(error));
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Redirect to login page (client-side only)
   */
  protected redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      if (!isAuthPagePath(currentPath)) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  /**
   * Cookie-auth needs two extra headers on every state-changing browser call:
   * the CSRF token (double-submit) and the selected academy id. They are built
   * here so `fetch` calls and XHR uploads cannot drift apart — a missing CSRF
   * header on an upload is rejected before the body is read, which the browser
   * surfaces as ERR_CONNECTION_RESET instead of 403.
   */
  protected browserContextHeaders(
    endpoint: string,
    method: string,
    csrfToken?: string | null,
  ): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const headers = csrfHeader(method, csrfToken);

    if (this.isAuthFlowEndpoint(endpoint)) return headers;

    return { ...headers, ...selectedAcademyHeader() };
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryAfterRefresh: boolean = true,
    lang?: string | null,
    retryAfterCsrf: boolean = true,
  ): Promise<ApiResponse<T>> {
    this.throwIfPaused(endpoint);

    const method = (options.method ?? 'GET').toUpperCase();
    const storm = trackRoute(method, endpoint);
    if (storm.tripped) this.handleRequestStorm(endpoint, method, storm.count);

    const url = `${lang ? getBrowserApiBaseUrl(lang) : this.baseURL}${endpoint}`;

    // SECURITY: JWT token is stored in HttpOnly cookie and sent automatically by browser
    // We no longer read tokens from localStorage to prevent XSS attacks
    // The browser will automatically include the HttpOnly cookie with credentials: 'include'

    // Don't set Content-Type for FormData (let browser set it to multipart/form-data)
    const headersObj: Record<string, string> =
      options.body instanceof FormData
        ? { ...(options.headers as Record<string, string>) } // No Content-Type for FormData
        : {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
          };

    // SECURITY: JWT is automatically sent via HttpOnly cookie with credentials: 'include'
    // No need to manually add Authorization header for cookie-based auth

    const isAuthFlowEndpoint = this.isAuthFlowEndpoint(endpoint);
    const needsCsrf = typeof window !== 'undefined' && !['GET', 'HEAD', 'OPTIONS'].includes(method);

    // Fresh / incognito tabs have no csrf cookie yet — bootstrap quietly so
    // the first write does not 403 with a scary toast.
    const csrfToken = needsCsrf ? await ensureCsrfToken(!retryAfterCsrf) : null;

    const headers: HeadersInit = {
      ...this.browserContextHeaders(endpoint, method, csrfToken),
      ...headersObj,
    };

    const config: RequestInit = {
      headers,
      credentials: 'include',
      ...options,
    };

    if (process.env.NODE_ENV !== 'production') {
      config.cache = 'no-store';
      (config as any).next = {
        ...(options as any)?.next,
        revalidate: 0,
      };
    }

    try {
      const response = await fetch(url, config);

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // Response has no JSON body or failed to parse; keep data as null
      }

      // Handle unauthorized responses (401) - attempt token refresh, then redirect to login
      if (response.status === 401 && retryAfterRefresh) {
        // Skip refresh for auth endpoints (login/register/otp/password reset flows)
        const isAuthEndpoint = isAuthFlowEndpoint;

        if (!isAuthEndpoint) {
          logger.ok('Auth', 'AccessTokenExpired');
          const refreshSuccess = await this.refreshToken();

          if (refreshSuccess) {
            // Retry the original request with the new token
            return this.request<T>(endpoint, options, false, lang, retryAfterCsrf);
          }
        }

        // For auth endpoints, let the caller handle the message (avoid extra redirect/toast).
        // Same on an auth page: a visitor there is already logging in, so "please log
        // in again" toasts, a redirect to /login and the session pause are all noise.
        const onAuthPage =
          typeof window !== 'undefined' && isAuthPagePath(window.location.pathname);

        if (isAuthEndpoint || onAuthPage) {
          throw new ApiResponseError(parseApiError(response.status, data));
        }

        // Refresh failed - redirect to login
        const sessionError = new ApiResponseError(parseApiError(response.status, data));
        const errorMessage = resolveApiErrorMessage(sessionError, currentLanguage());

        // Pause further calls before redirect so parallel mounts do not hammer auth
        this.enterPause('session');

        if (typeof window !== 'undefined') {
          toast.error(errorMessage);
          this.redirectToLogin();
        }

        throw sessionError;
      }

      // Stale / missing CSRF after a new tab — mint once and retry silently.
      if (retryAfterCsrf && needsCsrf && isCsrfRequiredError(data, response.status)) {
        await ensureCsrfToken(true);
        return this.request<T>(endpoint, options, retryAfterRefresh, lang, false);
      }

      // Handle forbidden responses (403) - legal consent modal or redirect to dashboard
      if (response.status === 403) {
        const payload =
          data && typeof data.message === 'object' && data.message !== null
            ? (data.message as Record<string, unknown>)
            : (data as Record<string, unknown> | null);
        const legalConsentCode =
          payload?.code === 'LEGAL_CONSENT_REQUIRED' ||
          (data as Record<string, unknown> | null)?.code === 'LEGAL_CONSENT_REQUIRED';

        if (legalConsentCode) {
          const pendingRaw = (payload?.pending ??
            (data as Record<string, unknown> | null)?.pending) as unknown;
          const pending = Array.isArray(pendingRaw)
            ? (pendingRaw as LegalConsentRequiredDetail['pending'])
            : [];
          this.enterPause('legal', pending);
          const error = new Error('LEGAL_CONSENT_REQUIRED') as Error & {
            code: string;
            pending: LegalConsentRequiredDetail['pending'];
          };
          error.code = 'LEGAL_CONSENT_REQUIRED';
          error.pending = pending;
          throw error;
        }

        const sellerIdentityCode =
          payload?.code === SELLER_IDENTITY_INCOMPLETE ||
          (data as Record<string, unknown> | null)?.code === SELLER_IDENTITY_INCOMPLETE;

        if (sellerIdentityCode) {
          const missingRaw = (payload?.missing ??
            (data as Record<string, unknown> | null)?.missing) as unknown;
          const allowed = new Set<SellerIdentityField>([
            'legal_entity_name',
            'national_id',
            'contact_address',
            'permit_declared',
          ]);
          const missing = Array.isArray(missingRaw)
            ? missingRaw.filter(
                (item): item is SellerIdentityField =>
                  typeof item === 'string' && allowed.has(item as SellerIdentityField),
              )
            : [];
          throw createSellerIdentityIncompleteError(missing);
        }

        const kycIncompleteCode =
          payload?.code === KYC_INCOMPLETE ||
          (data as Record<string, unknown> | null)?.code === KYC_INCOMPLETE;

        if (kycIncompleteCode) {
          const missingRaw = (payload?.missing ??
            (data as Record<string, unknown> | null)?.missing) as unknown;
          const missing = parseKycMissingFields(missingRaw);
          const kycError = createKycIncompleteError(missing);
          const errorMessage = resolveApiErrorMessage(
            new ApiResponseError(parseApiError(response.status, data)),
            currentLanguage(),
          );
          if (
            typeof window !== 'undefined' &&
            !isAuthPagePath(window.location.pathname) &&
            !window.location.pathname.startsWith(KYC_PROFILE_PATH)
          ) {
            toast.error(errorMessage, {
              toastId: `kyc-incomplete:${errorMessage}`,
              onClick: () => {
                window.location.assign(KYC_IDENTITY_PATH);
              },
            });
            window.location.assign(KYC_IDENTITY_PATH);
          }
          throw kycError;
        }

        const forbiddenError = new ApiResponseError(parseApiError(response.status, data));
        if (isPanelAccessBlockedError(forbiddenError)) {
          if (
            typeof window !== 'undefined' &&
            !isAuthPagePath(window.location.pathname) &&
            window.location.pathname !== '/unauthorized'
          ) {
            window.location.assign('/unauthorized');
          }
          throw forbiddenError;
        }
        const errorMessage = resolveApiErrorMessage(forbiddenError, currentLanguage());

        // A denied action is not a broken session: tell the user what happened and
        // leave them on the page. Pages the user may not open at all are blocked by
        // the route guards, not by this handler.
        // CSRF_REQUIRED should already have been retried above — if it still
        // lands here, skip the scary toast so a race does not annoy the user.
        if (typeof window !== 'undefined' && !isCsrfRequiredError(data, response.status)) {
          const onAuthPage = isAuthPagePath(window.location.pathname);
          if (!isAuthFlowEndpoint && !onAuthPage) {
            // Same denial from parallel requests shows one toast, not a stack of them.
            toast.error(errorMessage, { toastId: `forbidden:${errorMessage}` });
          }
        }

        throw forbiddenError;
      }

      // Handle payment required (402) - subscription expired/inactive.
      // A lapsed academy stays read-only (GETs still work); only writes 402 here.
      // Surface a toast + dismissible warning + Upgrade CTA, then reject so the
      // caller can reset its pending state (a never-settling promise froze forms).
      if (response.status === 402) {
        const subscriptionError = new ApiResponseError(parseApiError(response.status, data));
        const errorMessage = resolveApiErrorMessage(subscriptionError, currentLanguage());
        if (
          typeof window !== 'undefined' &&
          !isAuthFlowEndpoint &&
          !isAuthPagePath(window.location.pathname)
        ) {
          toast.error(errorMessage, {
            toastId: `subscription:${errorMessage}`,
          });
          this.notifySubscriptionRequired(errorMessage);
        }
        throw subscriptionError;
      }

      if (!response.ok) {
        throw new ApiResponseError(parseApiError(response.status, data));
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      logger.error('Api', 'RequestFailed', errorFields(error));
      throw error;
    }
  }

  // Media endpoints
  // Shared XHR uploader so every asset type (image/audio/document/video)
  // reports upload progress through one code path instead of duplicating it.
  protected async uploadFileWithProgress(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    abortController?: AbortController,
  ): Promise<{ data?: unknown } & Record<string, unknown>> {
    const csrfToken = await ensureCsrfToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let lastProgress = 0;

      if (abortController) {
        abortController.signal.addEventListener('abort', () => xhr.abort());
      }

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          if (progress !== lastProgress) {
            lastProgress = progress;
            onProgress(progress);
          }
        }
      });
      xhr.upload.addEventListener('loadstart', () => onProgress?.(0));

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            onProgress?.(100);
            resolve(response);
          } catch {
            reject(new Error('Failed to parse response'));
          }
        } else {
          let body: unknown = null;
          try {
            body = JSON.parse(xhr.responseText);
          } catch {
            body = null;
          }
          reject(new ApiResponseError(parseApiError(xhr.status, body)));
        }
      });
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
      xhr.ontimeout = () => reject(new Error('Upload timeout'));

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      xhr.withCredentials = true;
      for (const [key, value] of Object.entries(
        this.browserContextHeaders(endpoint, 'POST', csrfToken),
      )) {
        xhr.setRequestHeader(key, value);
      }
      xhr.timeout = 300000; // 5 minutes
      xhr.send(formData);
    });
  }
}
