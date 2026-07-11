import { OtpType } from '@/constants/data';
import { Enrollment, User as UserType } from '@/types/api';
import { toast } from 'react-toastify';
import { t } from './i18n';
import { DEFAULT_LANGUAGE, type LanguageCode } from './i18n/config';
import { getBrowserApiBaseUrl } from './api-base-url';
import { ApiResponseError } from './api-toast';
import { isAuthPagePath } from './auth-routes';
import type {
  AssignmentListResponse,
  AssignmentSubmission,
  CreateTutoringEngagementPayload,
  CreateTutoringOfferPayload,
  EnrollmentListResponse,
  LearningAssignment,
  LearningSummaryResponse,
  LearningTimelineResponse,
  LessonDownloadPolicy,
  OpsQueueResponse,
  RescheduleTutoringSessionPayload,
  ScheduleTutoringSessionPayload,
  SubmissionListResponse,
  TutoringAttendanceStatus,
  TutoringEngagement,
  TutoringOffer,
  TutoringSession,
  UpdateLessonDownloadPolicyPayload
} from '@/types/learning-operations';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function unwrapDataEnvelope<T>(payload: T | { data: T }): T {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

/** Why the client stopped issuing new API calls (first 401/403 wins). */
export type ApiPauseReason = 'session' | 'legal' | 'forbidden';

export const LEGAL_CONSENT_REQUIRED_EVENT = 'mentoma:legal-consent-required';

export type LegalConsentRequiredDetail = {
  pending: { type: string; title: string; version: string }[];
};

export interface AcademyFeatureFlags {
  enrollment_enabled: boolean;
  subscription_enabled: boolean;
  live_classes_enabled: boolean;
  tutor_led_learning_enabled: boolean;
}

class ApiClient {
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  /** Blocks new fetches after the first auth/consent failure to avoid throttle storms. */
  private pauseReason: ApiPauseReason | null = null;

  /** Resolve base URL per request so language switches apply immediately. */
  private get baseURL(): string {
    return getBrowserApiBaseUrl();
  }

  constructor() {}

  getPauseReason(): ApiPauseReason | null {
    return this.pauseReason;
  }

  /** Clear the pause gate after legal accept (or a full page navigation). */
  resumeRequests(): void {
    this.pauseReason = null;
  }

  /**
   * Pause non-allowlisted calls when pending legal docs are known
   * (from status check or a 403 LEGAL_CONSENT_REQUIRED response).
   */
  pauseForLegalConsent(
    pending: LegalConsentRequiredDetail['pending'] = []
  ): void {
    this.enterPause('legal', pending);
  }

  private enterPause(
    reason: ApiPauseReason,
    pending?: LegalConsentRequiredDetail['pending']
  ): void {
    // First pause wins. Allow legal→legal so we can refresh the pending payload/event.
    if (
      this.pauseReason !== null &&
      !(this.pauseReason === 'legal' && reason === 'legal')
    ) {
      return;
    }
    this.pauseReason = reason;
    if (
      reason === 'legal' &&
      typeof window !== 'undefined' &&
      Array.isArray(pending) &&
      pending.length > 0
    ) {
      window.dispatchEvent(
        new CustomEvent<LegalConsentRequiredDetail>(
          LEGAL_CONSENT_REQUIRED_EVENT,
          { detail: { pending } }
        )
      );
    }
  }

  private isAllowedDuringPause(endpoint: string): boolean {
    if (this.isAuthFlowEndpoint(endpoint)) return true;
    // Session bootstrap + legal accept/status must work while paused
    if (endpoint.includes('/auth/me')) return true;
    if (endpoint.includes('/legal/acceptances')) return true;
    return false;
  }

  private throwIfPaused(endpoint: string): void {
    if (!this.pauseReason || this.isAllowedDuringPause(endpoint)) return;

    if (this.pauseReason === 'legal') {
      const error = new Error('LEGAL_CONSENT_REQUIRED') as Error & {
        code: string;
      };
      error.code = 'LEGAL_CONSENT_REQUIRED';
      throw error;
    }

    if (this.pauseReason === 'session') {
      throw new Error('Session expired. API calls paused.');
    }

    throw new Error('Request blocked after forbidden response.');
  }

  /**
   * Attempt to refresh the access token using the refresh token cookie
   * Returns true if refresh was successful, false otherwise
   */
  private async refreshToken(): Promise<boolean> {
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
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('[Auth] Token refreshed successfully');
          return true;
        }

        console.warn('[Auth] Token refresh failed:', response.status);
        return false;
      } catch (error) {
        console.error('[Auth] Token refresh error:', error);
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
  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      if (!isAuthPagePath(currentPath)) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  /**
   * Redirect to dashboard page (client-side only)
   */
  private redirectToDashboard(): void {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/dashboard') && !isAuthPagePath(currentPath)) {
        window.location.href = '/dashboard';
      }
    }
  }

  private isAuthFlowEndpoint(endpoint: string): boolean {
    return (
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/public/login') ||
      endpoint.includes('/auth/staff/login') ||
      endpoint.includes('/auth/admin/login') ||
      endpoint.includes('/auth/forget-password') ||
      endpoint.includes('/auth/admin/forget-password') ||
      endpoint.includes('/auth/login-by-phone-otp') ||
      endpoint.includes('/auth/login-by-email-otp') ||
      endpoint.includes('/auth/register') ||
      endpoint.includes('/auth/otp/') ||
      endpoint.includes('/auth/refresh')
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryAfterRefresh: boolean = true,
    lang?: string | null
  ): Promise<ApiResponse<T>> {
    this.throwIfPaused(endpoint);

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
            ...(options.headers as Record<string, string>)
          };

    // SECURITY: JWT is automatically sent via HttpOnly cookie with credentials: 'include'
    // No need to manually add Authorization header for cookie-based auth

    // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
    if (
      typeof window !== 'undefined' &&
      options.method &&
      !['GET', 'HEAD'].includes(options.method)
    ) {
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrf-token='))
        ?.split('=')[1];

      if (csrfToken && !headersObj['X-CSRF-Token']) {
        headersObj['X-CSRF-Token'] = csrfToken;
      }
    }

    const isAuthFlowEndpoint = this.isAuthFlowEndpoint(endpoint);

    // Add store ID header if available (from localStorage - non-sensitive context data)
    // But don't add it for admins without stores or auth flows (login/register use profile pick)
    if (typeof window !== 'undefined' && !isAuthFlowEndpoint) {
      // Use the same key as store-utils.ts
      const academyId = window.localStorage.getItem(
        'skillforge_selected_academy_id'
      );
      const hasSelectedAcademy =
        !!academyId && academyId !== 'null' && academyId !== '';

      // Admin without a store: suppress the header only in Platform mode (no
      // academy selected). An explicit selection (Academy mode) must scope
      // requests via X-Academy-ID — entering Platform mode clears that id.
      let shouldAddStoreHeader = true;
      try {
        const userStateStr = window.localStorage.getItem('user_state');
        if (userStateStr) {
          const userState = JSON.parse(userStateStr);
          if (
            userState?.role === 'ADMIN' &&
            !hasSelectedAcademy &&
            (userState?.academy_id === null ||
              userState?.academy_id === undefined)
          ) {
            shouldAddStoreHeader = false;
          }
        }
      } catch (e) {
        // If parsing fails, continue with default behavior
      }

      if (
        shouldAddStoreHeader &&
        hasSelectedAcademy &&
        !headersObj['X-Academy-ID']
      ) {
        headersObj['X-Academy-ID'] = academyId as string;
      }
    }

    const headers: HeadersInit = headersObj;

    const config: RequestInit = {
      headers,
      credentials: 'include',
      ...options
    };

    if (process.env.NODE_ENV !== 'production') {
      config.cache = 'no-store';
      (config as any).next = {
        ...(options as any)?.next,
        revalidate: 0
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
          console.log('[Auth] Access token expired, attempting refresh...');
          const refreshSuccess = await this.refreshToken();

          if (refreshSuccess) {
            // Retry the original request with the new token
            return this.request<T>(endpoint, options, false);
          }
        }

        // For auth endpoints, let the caller handle the message (avoid extra redirect/toast)
        if (isAuthEndpoint) {
          throw new Error(
            (data && (data.message || data.error)) || 'Authentication failed'
          );
        }

        // Refresh failed - redirect to login
        const getCurrentLanguage = (): LanguageCode => {
          if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
          const stored = localStorage.getItem('preferred_language');
          const validLanguages: LanguageCode[] = [
            'en',
            'fa',
            'ar',
            'tr',
            'de',
            'fr',
            'es',
            'it',
            'ru',
            'zh',
            'ja',
            'ko',
            'hi',
            'ur',
            'he'
          ];
          return stored && validLanguages.includes(stored as LanguageCode)
            ? (stored as LanguageCode)
            : DEFAULT_LANGUAGE;
        };

        const rawMsg = data && (data.message || data.error);
        const errorMessage =
          (Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg) ||
          t('error.sessionExpired', getCurrentLanguage());

        // Pause further calls before redirect so parallel mounts do not hammer auth
        this.enterPause('session');

        if (typeof window !== 'undefined') {
          toast.error(errorMessage);
          this.redirectToLogin();
        }

        throw new Error(errorMessage);
      }

      // Handle forbidden responses (403) - legal consent modal or redirect to dashboard
      if (response.status === 403) {
        const payload =
          data && typeof data.message === 'object' && data.message !== null
            ? (data.message as Record<string, unknown>)
            : (data as Record<string, unknown> | null);
        const legalConsentCode =
          payload?.code === 'LEGAL_CONSENT_REQUIRED' ||
          (data as Record<string, unknown> | null)?.code ===
            'LEGAL_CONSENT_REQUIRED';

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

        const getCurrentLanguage = (): LanguageCode => {
          if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
          const stored = localStorage.getItem('preferred_language');
          const validLanguages: LanguageCode[] = [
            'en',
            'fa',
            'ar',
            'tr',
            'de',
            'fr',
            'es',
            'it',
            'ru',
            'zh',
            'ja',
            'ko',
            'hi',
            'ur',
            'he'
          ];
          return stored && validLanguages.includes(stored as LanguageCode)
            ? (stored as LanguageCode)
            : DEFAULT_LANGUAGE;
        };

        const rawMsg403 = data && (data.message || data.error);
        const errorMessage =
          (Array.isArray(rawMsg403) ? rawMsg403.join(', ') : rawMsg403) ||
          t('error.noPermission', getCurrentLanguage());

        if (typeof window !== 'undefined') {
          const onAuthPage = isAuthPagePath(window.location.pathname);
          if (!isAuthFlowEndpoint && !onAuthPage) {
            // Only pause when we redirect — silent 403s (e.g. role probes) must not lock the app
            this.enterPause('forbidden');
            toast.error(errorMessage);
            this.redirectToDashboard();
          }
        }

        throw new Error(errorMessage);
      }

      // Handle payment required (402) - subscription expired/inactive
      if (response.status === 402) {
        const rawMsg402 = data && (data.message || data.error);
        const errorMessage =
          (Array.isArray(rawMsg402) ? rawMsg402.join(', ') : rawMsg402) ||
          'Subscription is required to continue.';
        if (typeof window !== 'undefined') {
          if (
            !isAuthFlowEndpoint &&
            !isAuthPagePath(window.location.pathname)
          ) {
            toast.error(errorMessage);
            if (!window.location.pathname.includes('/settings/academy')) {
              window.location.href = '/settings/academy';
            }
          }
        }
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        const fa =
          data?.message ||
          data?.error ||
          `HTTP error! status: ${response.status}`;
        const en = data?.message_en || (Array.isArray(fa) ? fa.join(', ') : fa);
        throw new ApiResponseError(
          Array.isArray(fa) ? fa.join(', ') : String(fa),
          Array.isArray(en) ? en.join(', ') : String(en)
        );
      }

      return {
        data,
        status: response.status
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  /**
   * Staff login for MANAGER/TEACHER (admin panel)
   * academy_id is optional - if user has multiple stores, will return available stores for selection
   */
  async login(credentials: {
    identifier: string;
    password: string;
    academy_id?: number;
  }) {
    const response = this.request('/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    return response;
  }

  /**
   * Public login for STUDENT/USER (store-specific)
   * academy_id is REQUIRED
   */
  async publicLogin(credentials: {
    identifier: string;
    password: string;
    academy_id: number;
  }) {
    const response = this.request('/auth/public/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    return response;
  }

  /**
   * Admin login for ADMIN role (platform-level)
   * Requires email + phone + password
   */
  async adminLogin(credentials: {
    email: string;
    phone_number: string;
    password: string;
  }) {
    const response = this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    return response;
  }

  async register(userData: {
    name: string;
    phone_number: string;
    email?: string;
    password: string;
    confirmed_password: string;
    role: string;
    academy_id?: number;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
    accepted_terms_version?: string;
    accepted_privacy_version?: string;
    accepted_agreement_version?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getLegalDocuments(lang?: string) {
    return this.request<
      { type: string; version: string; title: string; published_at: string }[]
    >(`/legal/documents`, { method: 'GET' }, true, lang);
  }

  async getLegalDocument(type: string, lang?: string) {
    const res = await this.request<{
      title: string;
      body: string;
      version: string;
      type: string;
      locale: string;
    }>(
      `/legal/documents/${encodeURIComponent(type)}`,
      { method: 'GET' },
      true,
      lang
    );
    return (res.data as { data?: typeof res.data })?.data ?? res.data;
  }

  async getLegalAcceptanceStatus(lang?: string) {
    return this.request<{
      up_to_date: boolean;
      pending: { type: string; title: string; version: string }[];
    }>(`/legal/acceptances/status`, { method: 'GET' }, true, lang);
  }

  async acceptPlatformLegalDocuments(lang?: string) {
    return this.request<{ accepted: string[] }>(
      `/legal/acceptances/platform`,
      {
        method: 'POST',
        body: JSON.stringify({})
      },
      true,
      lang
    );
  }

  async getLegalAdminOverview(type: string, lang = 'fa') {
    const res = await this.request<{
      current: {
        id: string;
        type: string;
        locale: string;
        version: string;
        title: string;
        status: string;
        is_current: boolean;
        published_at: string | null;
        created_at: string;
        content_hash: string;
      } | null;
      draft: {
        id: string;
        title: string;
        body: string;
        updated_at: string;
      } | null;
      suggested_version: string;
      history: {
        id: string;
        type: string;
        locale: string;
        version: string;
        title: string;
        status: string;
        is_current: boolean;
        published_at: string | null;
        created_at: string;
        content_hash: string;
      }[];
    }>(
      `/legal/admin/documents/${encodeURIComponent(type)}`,
      { method: 'GET' },
      true,
      lang
    );
    return (res.data as { data?: typeof res.data })?.data ?? res.data;
  }

  async saveLegalDraft(
    type: string,
    payload: { title: string; body: string; locale?: string }
  ) {
    const lang = payload.locale;
    const res = await this.request<{
      id: string;
      type: string;
      locale: string;
      title: string;
      body: string;
      status: string;
    }>(
      `/legal/admin/documents/${encodeURIComponent(type)}/draft`,
      {
        method: 'PUT',
        body: JSON.stringify({ title: payload.title, body: payload.body })
      },
      true,
      lang
    );
    return (res.data as { data?: typeof res.data })?.data ?? res.data;
  }

  async publishLegalDocument(
    type: string,
    payload: { version: string; locale?: string }
  ) {
    const lang = payload.locale;
    const res = await this.request<{
      id: string;
      type: string;
      locale: string;
      version: string;
      title: string;
      status: string;
      is_current: boolean;
      published_at: string | null;
      content_hash: string;
    }>(
      `/legal/admin/documents/${encodeURIComponent(type)}/publish`,
      {
        method: 'POST',
        body: JSON.stringify({ version: payload.version })
      },
      true,
      lang
    );
    return (res.data as { data?: typeof res.data })?.data ?? res.data;
  }

  async createUser(data: {
    name: string;
    phone_number: string;
    password: string;
    role: string;
    academy_id: number;
    display_name?: string;
  }) {
    return this.request('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async loginPhoneByOtp(credentials: {
    phone_number: string;
    otp: string;
    academy_id?: number;
  }) {
    return this.request('/auth/login-by-phone-otp', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async sendAdminLoginOtp(email: string, phone_number: string) {
    return this.request('/auth/admin/login-otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, phone_number })
    });
  }

  async loginEmailByOtp(credentials: {
    email: string;
    otp: string;
    academy_id?: number;
  }) {
    return this.request('/auth/login-by-email-otp', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async selectAcademy(data: { temp_token: string; academy_id: number }) {
    return this.request('/auth/select-academy', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async switchAcademy(academy_id: number) {
    return this.request('/auth/switch-academy', {
      method: 'POST',
      body: JSON.stringify({ academy_id })
    });
  }

  // Note: These enhanced auth endpoints have been removed
  // Use the standard auth endpoints instead
  async switchProfile() {
    throw new Error(
      'switchProfile endpoint not available - use standard auth flow'
    );
  }

  async getUserAcademies() {
    const response = await this.request('/academies');
    return response.data;
  }

  async createProfile(profileData: {
    academy_id: number;
    role: string;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
  }) {
    return this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  // OTP endpoints - Updated to use new OTP controller
  async sendPhoneOtp(phone_number: string, type: OtpType) {
    return this.request('/auth/otp/send-phone', {
      method: 'POST',
      body: JSON.stringify({ phone_number, type })
    }) as any;
  }

  async sendEmailOtp(email: string, type: OtpType) {
    return this.request('/auth/otp/send-email', {
      method: 'POST',
      body: JSON.stringify({ email, type })
    }) as any;
  }

  async verifyPhoneOtp(phone_number: string, otp: string, type: OtpType) {
    return this.request('/auth/otp/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ phone_number, otp, type })
    }) as any;
  }

  async verifyEmailOtp(email: string, otp: string, type: OtpType) {
    return this.request('/auth/otp/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp, type })
    }) as any;
  }

  // Forget password endpoints
  async forgetPassword(data: {
    identifier: string;
    password: string;
    confirmed_password: string;
    otp: string;
    role?: string;
    academy_id?: number;
  }) {
    return this.request('/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async adminForgetPassword(data: {
    email: string;
    phone_number: string;
    password: string;
    confirmed_password: string;
    otp: string;
  }) {
    return this.request('/auth/admin/forget-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAcademies() {
    const response = await this.request('/academies');
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getAcademiesPublic() {
    const response = await this.request('/academies/public');
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getMyAcademies() {
    const response = await this.request('/academies');
    return response;
  }

  async getSupportAccessLogs(params?: {
    academy_id?: string;
    actor_user_id?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.academy_id) qs.append('academy_id', params.academy_id);
    if (params?.actor_user_id) qs.append('actor_user_id', params.actor_user_id);
    if (params?.from) qs.append('from', params.from);
    if (params?.to) qs.append('to', params.to);
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    const query = qs.toString();
    const response = await this.request(
      `/support-access-logs${query ? `?${query}` : ''}`
    );
    return response.data as {
      message: string;
      status: string;
      data: Array<{
        id: string;
        actor_user_id: string;
        actor_profile_id: string | null;
        academy_id: string;
        method: string;
        path: string;
        created_at: string;
      }>;
      total: number;
      page: number;
      limit: number;
    };
  }

  // ----- Support tickets (staff) -----
  private supportQuery(params?: Record<string, string | undefined>) {
    const qs = new URLSearchParams();
    if (params)
      for (const [k, v] of Object.entries(params)) if (v) qs.append(k, v);
    const s = qs.toString();
    return s ? `?${s}` : '';
  }

  async getSupportInbox(params?: SupportInboxQuery) {
    const res = await this.request(
      `/support/inbox${this.supportQuery(this.supportInboxQueryParams(params))}`
    );
    return unwrapSupportInbox(res);
  }

  async getSupportPlatformInbox(params?: SupportInboxQuery) {
    const res = await this.request(
      `/support/platform/inbox${this.supportQuery(this.supportInboxQueryParams(params))}`
    );
    return unwrapSupportInbox(res);
  }

  private supportInboxQueryParams(
    params?: SupportInboxQuery
  ): Record<string, string | undefined> {
    if (!params) return {};
    return {
      status: params.status,
      priority: params.priority,
      academy_id: params.academy_id,
      category: params.category,
      assigned_to: params.assigned_to,
      search: params.search,
      page: params.page != null ? String(params.page) : undefined,
      limit: params.limit != null ? String(params.limit) : undefined
    };
  }

  async getSupportTicket(id: string) {
    const res = await this.request(`/support/tickets/${id}`);
    return (res as any).data;
  }

  async listSupportResponsibles() {
    const res = await this.request(`/support/responsibles`);
    return (res as any).data;
  }

  async getPlatformResponsibles() {
    const res = await this.request(`/support/platform/responsibles`);
    return (res as any).data;
  }

  async createPlatformTicket(body: {
    subject: string;
    body: string;
    category: string;
    priority?: string;
  }) {
    const res = await this.request(`/support/platform/tickets`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return (res as any).data;
  }

  async replySupportTicket(
    id: string,
    body: { body: string; image_ids?: string[]; internal_note?: boolean }
  ) {
    const res = await this.request(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return (res as any).data;
  }

  async reassignSupportTicket(id: string, responsible_id: string) {
    const res = await this.request(`/support/tickets/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ responsible_id })
    });
    return (res as any).data;
  }

  async changeSupportStatus(
    id: string,
    status: string,
    resolution_summary?: string
  ) {
    const res = await this.request(`/support/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution_summary })
    });
    return (res as any).data;
  }

  async changeSupportPriority(id: string, priority: string) {
    const res = await this.request(`/support/tickets/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority })
    });
    return (res as any).data;
  }

  async logSupportCall(
    id: string,
    body: { status: string; outcome_note?: string; called_at?: string }
  ) {
    const res = await this.request(`/support/tickets/${id}/log-call`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return (res as any).data;
  }

  async logSupportEmail(id: string, body: { outcome_note?: string }) {
    const res = await this.request(`/support/tickets/${id}/log-email`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return (res as any).data;
  }

  async getPlatformAcademiesHealth() {
    const res = await this.request('/platform/academies/health');
    const body = (
      res as {
        data?: {
          data?: { academies?: AcademyHealthView[] };
          academies?: AcademyHealthView[];
        };
      }
    ).data;
    return body?.data?.academies ?? body?.academies ?? [];
  }

  async getNotifications(params?: { page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    const query = qs.toString();
    const res = await this.request(`/notifications${query ? `?${query}` : ''}`);
    const body = (
      res as {
        data?: { data?: NotificationListResponse } & NotificationListResponse;
      }
    ).data;
    return body?.data ?? body;
  }

  async getUnreadNotificationCount() {
    const res = await this.request('/notifications/unread-count');
    const body = (
      res as { data?: { data?: { count?: number }; count?: number } }
    ).data;
    return body?.data?.count ?? body?.count ?? 0;
  }

  async markNotificationRead(id: string) {
    const res = await this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return (res as { data?: unknown }).data;
  }

  async markAllNotificationsRead() {
    const res = await this.request('/notifications/read-all', {
      method: 'POST'
    });
    return (res as { data?: unknown }).data;
  }

  async listPlatformBroadcasts() {
    const res = await this.request('/platform/broadcasts');
    const body = (
      res as {
        data?: {
          data?: { broadcasts?: PlatformBroadcast[] };
          broadcasts?: PlatformBroadcast[];
        };
      }
    ).data;
    return body?.data?.broadcasts ?? body?.broadcasts ?? [];
  }

  async createPlatformBroadcast(body: CreatePlatformBroadcastPayload) {
    const res = await this.request('/platform/broadcasts', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    const payload = (
      res as {
        data?: {
          data?: { broadcast?: PlatformBroadcast };
          broadcast?: PlatformBroadcast;
        };
      }
    ).data;
    return payload?.data?.broadcast ?? payload?.broadcast;
  }

  async sendPlatformBroadcast(id: string) {
    const res = await this.request(`/platform/broadcasts/${id}/send`, {
      method: 'POST'
    });
    const payload = (
      res as {
        data?: {
          data?: { broadcast?: PlatformBroadcast };
          broadcast?: PlatformBroadcast;
        };
      }
    ).data;
    return payload?.data?.broadcast ?? payload?.broadcast;
  }

  async getCurrentAcademy() {
    const response = await this.request('/academies/current');
    return response;
  }

  async checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
    const res = await this.request<{ available: boolean }>(
      `/academies/slug-available?slug=${encodeURIComponent(slug)}`
    );
    return (res as any)?.data ?? res;
  }

  async createAcademy(storeData: {
    name: string;
    private_domain: string;
    description?: string;
    logo_id?: string;
  }) {
    return this.request('/academies', {
      method: 'POST',
      body: JSON.stringify(storeData)
    });
  }

  async updateAcademy(storeData: {
    name?: string;
    private_domain?: string;
    public_address?: string | null;
    description?: string;
    logo_id?: string;
  }) {
    return this.request('/academies/current', {
      method: 'PATCH',
      body: JSON.stringify(storeData)
    });
  }

  async getCurrentAcademyFeatures(): Promise<AcademyFeatureFlags> {
    const res = await this.request<
      AcademyFeatureFlags | { data: AcademyFeatureFlags }
    >('/academies/current/features');
    return unwrapDataEnvelope(res.data);
  }

  async updateCurrentAcademyFeatures(
    data: Partial<AcademyFeatureFlags>
  ): Promise<AcademyFeatureFlags> {
    const res = await this.request<
      AcademyFeatureFlags | { data: AcademyFeatureFlags }
    >('/academies/current/features', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return unwrapDataEnvelope(res.data);
  }

  async updateAcademyById(
    _id: number,
    data: {
      name?: string;
      private_domain?: string;
      public_address?: string | null;
      description?: string;
      logo_id?: string;
    }
  ) {
    return this.updateAcademy(data);
  }

  async getCurrentAcademySubscription() {
    const response = await this.request('/academies/current/subscription');
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  async renewCurrentAcademySubscription(data: {
    plan_name: string;
    months: number;
    amount: number;
    note?: string;
  }) {
    const response = await this.request(
      '/academies/current/subscription/renew',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  async downloadCurrentAcademySubscriptionInvoicePdf(
    invoiceId: number
  ): Promise<Blob> {
    const endpoint = `/academies/current/subscription/invoices/${invoiceId}/pdf`;
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to download invoice PDF: ${response.status}`);
    }
    return response.blob();
  }

  // Courses endpoints
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    academy_id?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = (await this.request(
      `/courses?${queryParams.toString()}`
    )) as any;
    if (response.data.data && response.data.status === 'ok') {
      return response.data.data as { courses: any[]; pagination?: any };
    }
    return { courses: [], pagination: undefined };
  }

  async getCourse(id: string) {
    const response = await this.request(`/courses/${id}`);
    const payload = response.data as any;

    if (!payload) {
      return null as any;
    }

    // Handle standard API shape: { status: 'ok', data: {...}, user_state?: {...} }
    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    // Fallback for APIs that wrap the resource under `data`
    if (payload.data) {
      return payload.data;
    }

    // As a last resort, return the payload itself (already the resource)
    return payload;
  }

  async createCourse(courseData: {
    title: string;
    description: string;
    primary_price: number;
    secondary_price: number;
    meta_tags?: Array<{ title: string; content: string }>;
    category_id?: string;
    cover_id?: string;
    audio_id?: string;
    video_id?: string;
    document_id?: string;
    published?: boolean;
    is_featured?: boolean;
    access_duration_days?: number;
    seasons?: Array<{
      title: string;
      description?: string;
      lessons?: Array<{
        title: string;
        description?: string;
        duration?: number;
        is_free?: boolean;
        published?: boolean;
        video_id?: string;
        audio_id?: string;
        cover_id?: string;
      }>;
    }>;
    lessons?: Array<{
      title: string;
      description?: string;
      duration?: number;
      is_free?: boolean;
      published?: boolean;
      video_id?: string;
      audio_id?: string;
      cover_id?: string;
    }>;
  }) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async updateCourse(id: string, courseData: unknown) {
    return this.request(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(courseData)
    });
  }

  // Atomic "save the whole course": course fields + every season/lesson +
  // deletes in ONE backend transaction (no half-saved course on failure).
  async updateCourseContent(
    id: string,
    payload: {
      title?: string;
      description?: string;
      primary_price?: number;
      secondary_price?: number;
      category_id?: string;
      cover_id?: string;
      published?: boolean;
      is_featured?: boolean;
      access_duration_days?: number;
      seasons: Array<{
        id?: string;
        client_key: string;
        title: string;
        description?: string;
      }>;
      lessons: Array<{
        id?: string;
        title: string;
        description?: string;
        duration?: number;
        is_free?: boolean;
        published?: boolean;
        video_id?: string;
        audio_id?: string;
        cover_id?: string;
        season_id?: string;
        season_client_key?: string;
      }>;
      deleted_season_ids?: string[];
      deleted_lesson_ids?: string[];
    }
  ) {
    return this.request(`/courses/${id}/content`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Q&A endpoints
  async getCourseQnAs(courseId: number) {
    const response = await this.request(`/courses/${courseId}/qna`);
    const payload = response.data as { data?: unknown } | undefined;
    const nested =
      payload && typeof payload === 'object' ? payload.data : undefined;
    return Array.isArray(nested) ? nested : [];
  }

  async createCourseQnA(courseId: number, question: string) {
    return this.request(`/courses/${courseId}/qna`, {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  }

  async answerCourseQnA(courseId: number, qnaId: number, answer: string) {
    return this.request(`/courses/${courseId}/qna/${qnaId}/answer`, {
      method: 'PUT',
      body: JSON.stringify({ answer })
    });
  }

  async approveCourseQnA(courseId: number, qnaId: number, isApproved: boolean) {
    return this.request(`/courses/${courseId}/qna/${qnaId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ is_approved: isApproved })
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE'
    });
  }

  // ----- Quiz, Assessment & Discussion (checklist 5.19) -----
  private async quizData<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await this.request<{ data: T }>(endpoint, options);
    return (response.data as { data: T }).data;
  }

  async getLessonQuiz<T = unknown>(lessonId: string) {
    return this.quizData<T>(`/lessons/${lessonId}/quiz`);
  }

  async createQuiz(payload: {
    lesson_id: string;
    title: string;
    description?: string;
    passing_score?: number;
  }) {
    return this.quizData(`/quizzes`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateQuiz(
    id: string,
    payload: { title?: string; description?: string; passing_score?: number }
  ) {
    return this.quizData(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  async addQuizQuestion(
    quizId: string,
    payload: {
      type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT';
      prompt: string;
      points?: number;
      correct_boolean?: boolean;
      options?: { text: string; is_correct: boolean }[];
    }
  ) {
    return this.quizData(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateQuizQuestion(
    questionId: string,
    payload: {
      prompt?: string;
      points?: number;
      correct_boolean?: boolean;
      options?: { text: string; is_correct: boolean }[];
    }
  ) {
    return this.quizData(`/quiz-questions/${questionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  async deleteQuizQuestion(questionId: string) {
    return this.quizData(`/quiz-questions/${questionId}`, { method: 'DELETE' });
  }

  async reorderQuizQuestions(quizId: string, questionIds: string[]) {
    return this.quizData(`/quizzes/${quizId}/questions/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ question_ids: questionIds })
    });
  }

  async setQuizPublished(quizId: string, publish: boolean) {
    return this.quizData(
      `/quizzes/${quizId}/${publish ? 'publish' : 'unpublish'}`,
      { method: 'POST' }
    );
  }

  async listQuizAttempts<T = unknown>(quizId: string) {
    return this.quizData<T>(`/quizzes/${quizId}/attempts`);
  }

  async getQuizAttempt<T = unknown>(attemptId: string) {
    return this.quizData<T>(`/quiz-attempts/${attemptId}`);
  }

  async gradeQuizAnswer(answerId: string, awardedPoints: number) {
    return this.quizData(`/quiz-answers/${answerId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify({ awarded_points: awardedPoints })
    });
  }

  async reviewQuizAttempt(attemptId: string, feedback?: string) {
    return this.quizData(`/quiz-attempts/${attemptId}/review`, {
      method: 'POST',
      body: JSON.stringify({ feedback })
    });
  }

  async getDiscussionThread<T = unknown>(threadId: string) {
    return this.quizData<T>(`/discussions/threads/${threadId}`);
  }

  async postDiscussionMessage(
    parent: { attempt_id?: string; submission_id?: string },
    body: string
  ) {
    return this.quizData(`/discussions/messages`, {
      method: 'POST',
      body: JSON.stringify({ ...parent, body })
    });
  }

  // Products endpoints
  async getProducts(params?: {
    search?: string;
    title?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
    order_by?: string;
    published?: boolean;
    is_featured?: boolean;
    product_type?: 'DIGITAL' | 'PHYSICAL';
    category_id?: number;
    author_id?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    const response = await this.request(endpoint);
    const payload = response.data as any;

    if (payload && payload.status === 'ok' && payload.data) {
      return payload.data as { products: any[]; pagination?: any };
    }
    return { products: [], pagination: undefined };
  }

  async getProduct(id: number) {
    const response = await this.request(`/products/${id}`);
    const payload = response.data as any;

    if (!payload) {
      return null as any;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async createProduct(productData: {
    title: string;
    description: string;
    short_description?: string;
    price: number;
    original_price?: number;
    product_type: 'DIGITAL' | 'PHYSICAL';
    stock_quantity?: number;
    sku?: string;
    category_id?: number;
    cover_id?: number;
    published?: boolean;
    is_featured?: boolean;
    weight?: number;
    dimensions?: string;
  }) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id: number, productData: unknown) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Shipping & Orders endpoints
  async getShippingAddresses() {
    const response = await this.request('/shipping/addresses');
    const payload = response.data as any;
    if (payload && payload.status === 'ok' && payload.data) {
      return payload.data;
    }
    return [];
  }

  async createShippingAddress(addressData: {
    full_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province?: string;
    postal_code?: string;
    is_default?: boolean;
  }) {
    return this.request('/shipping/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  async updateShippingAddress(id: number, addressData: unknown) {
    return this.request(`/shipping/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData)
    });
  }

  async deleteShippingAddress(id: number) {
    return this.request(`/shipping/addresses/${id}`, {
      method: 'DELETE'
    });
  }

  async getOrders() {
    const response = await this.request('/shipping/orders');
    const payload = response.data as any;
    if (payload && payload.status === 'ok' && payload.data) {
      return payload.data;
    }
    return [];
  }

  async getOrder(id: number) {
    const response = await this.request(`/shipping/orders/${id}`);
    const payload = response.data as any;
    if (payload && payload.status === 'ok' && payload.data) {
      return payload.data;
    }
    return null;
  }

  async createOrder(orderData: {
    items: Array<{
      item_type: 'COURSE' | 'PRODUCT';
      item_id: number;
      quantity?: number;
    }>;
    shipping_address_id?: number;
    notes?: string;
  }) {
    return this.request('/shipping/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  // Lessons endpoints
  async getLessons(params?: {
    course_id?: string;
    season_id?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await this.request(`/lessons?${queryParams.toString()}`);
    const payload = response.data as any;

    if (!payload) {
      return [];
    }

    if (payload.status === 'ok' && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.lessons)) {
      return payload.lessons;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  async getLesson(id: string) {
    const response = await this.request(`/lessons/${id}`);
    const payload = response.data as any;

    if (!payload) {
      return null as any;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async createLesson(lessonData: {
    title: string;
    description?: string;
    course_id: string;
    season_id?: string;
    audio_id?: string;
    video_id?: string;
    cover_id?: string;
    document_id?: string;
    published?: boolean;
    is_free?: boolean;
    lesson_type?: string;
  }) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  }

  async updateLesson(id: string, lessonData: unknown) {
    return this.request(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(lessonData)
    });
  }

  async deleteLesson(id: string) {
    return this.request(`/lessons/${id}`, {
      method: 'DELETE'
    });
  }

  async upsertLiveSession(
    lessonId: string,
    body: {
      meeting_url: string;
      playback_url?: string | null;
      starts_at: string;
      ends_at?: string | null;
      duration_minutes?: number | null;
      timezone: string;
      recurrence_rule?: string | null;
      recurrence_until?: string | null;
      provider_label?: string | null;
      notes?: string | null;
    }
  ) {
    return this.request(`/lessons/${lessonId}/live-session`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async deleteLiveSession(lessonId: string) {
    return this.request(`/lessons/${lessonId}/live-session`, {
      method: 'DELETE'
    });
  }

  // Seasons endpoints
  async getSeasons(courseId?: string) {
    const queryParams = courseId ? `?course_id=${courseId}` : '';
    const response = await this.request(`/seasons${queryParams}`);
    const payload = response.data as any;

    if (!payload) {
      return [];
    }

    if (payload.status === 'ok' && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  async getSeason(id: string) {
    const response = await this.request(`/seasons/${id}`);
    const payload = response.data as any;

    if (!payload) {
      return null as any;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async createSeason(seasonData: {
    title: string;
    description?: string;
    order: number;
    course_id: string;
  }) {
    return this.request('/seasons', {
      method: 'POST',
      body: JSON.stringify(seasonData)
    });
  }

  async updateSeason(id: string, seasonData: unknown) {
    return this.request(`/seasons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(seasonData)
    });
  }

  async deleteSeason(id: string) {
    return this.request(`/seasons/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories endpoints
  async getCategories() {
    const response = await this.request('/categories');

    // Return the categories data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async createCategory(categoryData: {
    name: string;
    description?: string;
    type?:
      | 'COURSE'
      | 'ARTICLE'
      | 'BLOG'
      | 'NEWS'
      | 'VIDEO'
      | 'AUDIO'
      | 'DOCUMENT'
      | 'IMAGE'
      | 'ROOT';
    parent_id?: number;
    icon?: string;
    color?: string;
    sort_order?: number;
    is_active?: boolean;
  }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(
    id: number,
    categoryData: {
      name?: string;
      description?: string;
      type?:
        | 'COURSE'
        | 'ARTICLE'
        | 'BLOG'
        | 'NEWS'
        | 'VIDEO'
        | 'AUDIO'
        | 'DOCUMENT'
        | 'IMAGE'
        | 'ROOT';
      parent_id?: number;
      icon?: string;
      color?: string;
      sort_order?: number;
      is_active?: boolean;
    }
  ) {
    return this.request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Media endpoints
  // Shared XHR uploader so every asset type (image/audio/document/video)
  // reports upload progress through one code path instead of duplicating it.
  private uploadFileWithProgress(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ): Promise<{ data?: unknown } & Record<string, unknown>> {
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
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () =>
        reject(new Error('Upload cancelled'))
      );
      xhr.ontimeout = () => reject(new Error('Upload timeout'));

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      xhr.withCredentials = true;
      xhr.timeout = 300000; // 5 minutes
      xhr.send(formData);
    });
  }

  async uploadImage(
    file: File,
    metadata?: { title?: string; description?: string },
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ) {
    const formData = new FormData();
    formData.append('imagefile', file); // Backend expects 'imagefile'
    formData.append('alt', metadata?.title || file.name); // Backend expects 'alt' field

    const response = await this.uploadFileWithProgress(
      '/images/upload',
      formData,
      onProgress,
      abortController
    );
    return (response.data ?? null) as any;
  }

  // Alternative upload method with better progress tracking
  async uploadVideoWithProgress(
    file: File,
    metadata?: { title?: string; description?: string },
    posterFile?: File,
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ) {
    const formData = new FormData();
    formData.append('videofile', file);

    if (posterFile) {
      formData.append('posterfile', posterFile);
    }

    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let lastProgress = 0;

      // Handle abort controller
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      // Progress tracking with throttling
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);

          // Only update if progress has actually changed
          if (progress !== lastProgress) {
            lastProgress = progress;

            onProgress(progress);
          }
        }
      });

      // Event handlers
      xhr.upload.addEventListener('loadstart', () => {
        if (onProgress) onProgress(0);
      });

      xhr.upload.addEventListener('loadend', () => {
        console.log('Upload ended');
        // Don't set progress to 100% here - let the response handler do it
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            // Set progress to 100% when upload is successful
            if (onProgress) onProgress(100);
            resolve(response.data || response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () =>
        reject(new Error('Upload cancelled'))
      );
      xhr.ontimeout = () => reject(new Error('Upload timeout'));

      xhr.open('POST', `${this.baseURL}/videos/upload`);
      xhr.withCredentials = true;
      xhr.timeout = 300000; // 5 minutes

      console.log(`Starting upload: ${file.name} (${file.size} bytes)`);
      xhr.send(formData);
    });
  }

  async uploadVideo(
    file: File,
    metadata?: { title?: string; description?: string },
    posterFile?: File,
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ) {
    const formData = new FormData();
    formData.append('videofile', file); // Backend expects 'videofile'

    if (posterFile) {
      formData.append('posterfile', posterFile); // Backend expects 'posterfile'
    }

    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Handle abort controller
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      // Track upload progress with more detailed logging
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          console.log(
            `Upload progress: ${event.loaded}/${event.total} bytes (${progress}%)`
          );
          onProgress(progress);
        } else {
          console.log('Progress event not computable:', {
            lengthComputable: event.lengthComputable,
            loaded: event.loaded,
            total: event.total
          });
        }
      });

      // Track loadstart
      xhr.upload.addEventListener('loadstart', () => {
        console.log('Upload started');
        if (onProgress) onProgress(0);
      });

      // Track loadend - don't set progress to 100% here as it happens before response processing
      xhr.upload.addEventListener('loadend', () => {
        console.log('Upload ended');
        // Don't set progress to 100% here - let the response handler do it
      });

      // Track error events
      xhr.upload.addEventListener('error', (event) => {
        console.error('Upload error:', event);
      });

      // Track abort events
      xhr.upload.addEventListener('abort', (event) => {
        console.log('Upload aborted:', event);
      });

      // Handle response
      xhr.addEventListener('load', () => {
        console.log('Response received:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            // Set progress to 100% when upload is successful
            if (onProgress) onProgress(100);

            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Open and send request
      xhr.open('POST', `${this.baseURL}/videos/upload`);
      xhr.withCredentials = true; // Include credentials

      // Set timeout for better error handling
      xhr.timeout = 300000; // 5 minutes
      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };

      console.log(`Starting upload: ${file.name} (${file.size} bytes)`);
      xhr.send(formData);
    });
  }

  async uploadAudio(
    file: File,
    metadata?: { title?: string; description?: string },
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ) {
    const formData = new FormData();
    formData.append('audioFile', file); // Backend expects 'audioFile'
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.uploadFileWithProgress(
      '/audios/upload',
      formData,
      onProgress,
      abortController
    );
  }

  async uploadDocument(
    file: File,
    metadata?: { title?: string; description?: string },
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ) {
    const formData = new FormData();
    formData.append('documentfile', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.uploadFileWithProgress(
      '/files/upload',
      formData,
      onProgress,
      abortController
    );
  }

  async getImages() {
    const response = await this.request('/images');
    // Return the images data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getVideos() {
    const response = await this.request('/videos');
    // Return the videos data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  getVideoStreamUrl(videoId: string): string {
    return `${this.baseURL}/videos/stream/${videoId}`;
  }

  async getVideo(videoId: number) {
    const response = await this.request(`/videos/${videoId}`);
    return response.data;
  }

  async getAudios() {
    const response = await this.request('/audios');
    const payload = response.data as any;

    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload.status === 'ok' && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.audios)) {
      return payload.audios;
    }

    if (Array.isArray(payload?.data?.audios)) {
      return payload.data.audios;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  async getAudio(audioId: number) {
    const response = await this.request(`/audios/${audioId}`);
    const payload = response.data as any;

    if (!payload) {
      return null;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async updateAudio(
    audioId: number,
    audioData: { title?: string; description?: string; is_public?: boolean }
  ) {
    const response = await this.request(`/audios/${audioId}`, {
      method: 'PATCH',
      body: JSON.stringify(audioData)
    });

    return response.data as any;
  }

  async deleteAudio(audioId: number) {
    return this.request(`/audios/${audioId}`, {
      method: 'DELETE'
    });
  }

  async getDocuments() {
    const response = await this.request('/files');

    // Return the documents data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getDocument(documentId: number) {
    const response = await this.request(`/files/${documentId}`);
    const payload = response.data as any;

    if (!payload) {
      return null;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  // Image fetching endpoint
  async getImage(identifier: string | number) {
    const endpoint =
      typeof identifier === 'number'
        ? `/images/get-image?id=${identifier}`
        : `/images/get-image?filename=${identifier}`;

    return this.request(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'image/*'
      }
    });
  }

  // Image update endpoint
  async updateImage(imageId: string, data: { alt?: string }) {
    const response = await this.request(`/images/${imageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  // Image deletion endpoint
  async deleteImage(imageId: string) {
    return this.request(`/images/${imageId}`, {
      method: 'DELETE'
    });
  }

  // Profile endpoints
  async getCurrentProfile() {
    const response = await this.request('/profiles/current');
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async updateProfile(profileData: {
    display_name?: string;
    bio?: string;
    avatar_id?: number;
  }) {
    return this.request('/profiles/current', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    }) as any;
  }

  // Users endpoints
  private buildUserQuery(params?: {
    page?: number;
    limit?: number;
    search?: string;
    id?: number;
    uuid?: string;
    academy_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.id !== undefined)
      queryParams.append('id', params.id.toString());
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    if (params?.academy_id)
      queryParams.append('academy_id', params.academy_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  private mapUsersResponse(response: ApiResponse<any>) {
    const payload = response.data as any;

    if (!payload) {
      return null;
    }

    if (payload.status === 'fail') {
      throw new Error(payload.message || 'Failed to retrieve users');
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data?.profiles || payload.data?.pagination) {
      return payload.data;
    }

    if (payload.profiles || payload.pagination) {
      return payload;
    }

    return payload;
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    id?: number;
    uuid?: string;
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    academy_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
    is_active?: boolean;
    group_by_role?: boolean;
    filter?: 'none';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.id !== undefined)
      queryParams.append('id', params.id.toString());
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.academy_id)
      queryParams.append('academy_id', params.academy_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (params?.group_by_role) queryParams.append('group_by_role', 'true');
    if (params?.filter) queryParams.append('filter', params.filter);

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);

    // If grouped by role, return the full response structure
    if (params?.group_by_role) {
      return response.data;
    }

    return this.mapUsersResponse(response);
  }

  async getStudentUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    academy_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/students${query}`);
    return this.mapUsersResponse(response);
  }

  async getTeacherUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    academy_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/teachers${query}`);
    return this.mapUsersResponse(response);
  }

  async getManagerUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    academy_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/managers${query}`);
    return this.mapUsersResponse(response);
  }

  async getTeacherRequests(params?: {
    page?: number;
    limit?: number;
    academy_id?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.academy_id)
      queryParams.append('academy_id', params.academy_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const response = await this.request(
      `/users/teacher-requests${queryString ? `?${queryString}` : ''}`
    );

    const payload = response.data as any;

    if (payload?.status === 'ok' && payload?.data) {
      const normalizedRequests = Array.isArray(payload.data.requests)
        ? payload.data.requests.map((request: any) => {
            const profile =
              request.profile ||
              request.Profile_TeacherRequest_profile_idToProfile;
            const store = request.store || request.Academy;
            const reviewer =
              request.reviewer ||
              request.Profile_TeacherRequest_reviewed_byToProfile;

            return {
              ...request,
              profile: profile
                ? {
                    id: profile.id,
                    display_name: profile.display_name,
                    role: profile.role || profile.Role || null,
                    user: profile.user || profile.User || null
                  }
                : null,
              store,
              reviewer: reviewer
                ? {
                    ...reviewer,
                    user: reviewer.user || {
                      name: reviewer.display_name || null
                    }
                  }
                : null
            };
          })
        : [];

      return {
        ...payload.data,
        requests: normalizedRequests
      };
    }

    return payload;
  }

  async reviewTeacherRequest(
    id: number,
    payload: {
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      notes?: string;
    }
  ) {
    const response = await this.request(`/teacher-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

    return response.data as any;
  }

  async getUser(id: number): Promise<UserType> {
    const response = await this.request<UserType>(`/users/${id}`);
    return response.data;
  }

  async getUserDetails(id: number) {
    const response = await this.request(`/users/${id}/details`);
    return response.data as any;
  }

  async updateUser(id: number, userData: unknown) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
  }

  async disconnectFromStore(adminId: number, academyId?: number) {
    const queryParams = new URLSearchParams();
    if (academyId !== undefined) {
      queryParams.append('academy_id', academyId.toString());
    }
    const queryString = queryParams.toString();
    return this.request(
      `/users/${adminId}/disconnect-store${queryString ? `?${queryString}` : ''}`,
      {
        method: 'PATCH'
      }
    );
  }

  async createAdminUser(userData: {
    name: string;
    phone_number: string;
    email: string;
    password: string;
    phone_otp: string;
    email_otp: string;
    platform_role?: 'ADMIN' | 'FINANCE' | 'SUPPORT';
    auto_confirm_email?: boolean;
    auto_confirm_phone?: boolean;
  }) {
    const endpoint = userData.platform_role
      ? '/users/platform-staff'
      : '/users/admin';
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return response.data as any;
  }

  async getPlatformStaff(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) {
      queryParams.append('is_active', String(params.is_active));
    }
    const qs = queryParams.toString();
    const response = await this.request(
      `/users/platform-staff${qs ? `?${qs}` : ''}`
    );
    return response.data as any;
  }

  async updatePlatformStaff(
    id: string,
    body: {
      platform_role?: 'ADMIN' | 'FINANCE' | 'SUPPORT';
      is_active?: boolean;
      reason?: string;
    }
  ) {
    const response = await this.request(`/users/platform-staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    return response.data as any;
  }

  async revokePlatformStaffSessions(id: string) {
    const response = await this.request(
      `/users/platform-staff/${id}/sessions`,
      {
        method: 'DELETE'
      }
    );
    return response.data as any;
  }

  async changeUserRole(
    id: number,
    role: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER'
  ) {
    const response = await this.request(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
    return response.data as any;
  }

  async resetUserPassword(id: number, newPassword: string) {
    const response = await this.request(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword })
    });
    return response.data as any;
  }

  async grantCourseAccess(
    id: number,
    payload: { course_id: number; note?: string }
  ) {
    const response = await this.request(`/users/${id}/grant-course`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data as any;
  }

  async assignVoucher(
    id: number,
    payload: {
      code_prefix: string;
      discount_type: 'PERCENT' | 'FIXED';
      discount_value: number;
      expires_at?: string;
      max_discount_amount?: number;
    }
  ) {
    const response = await this.request(`/users/${id}/assign-voucher`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data as any;
  }

  // Transactions endpoints
  async getTransactions() {
    const response = await this.request('/transactions');

    // Return the transactions data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getTransaction(id: number) {
    const response = await this.request(`/transactions/${id}`);

    // Return the transaction data directly
    if (response.data) {
      return response.data;
    }
    return response;
  }

  // Domain endpoints
  async validatePrivateDomain(domain: string) {
    return this.request('/domain/is-valid-private-domain', {
      method: 'POST',
      body: JSON.stringify({ domain })
    });
  }

  async generateUniqueDomainName() {
    return this.request('/domain/generate-unique-name');
  }

  async getRecentEnrollments() {
    const response = await this.request('/enrollments/recent');

    // Return the enrollments data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getRecentPayments() {
    const response = await this.request('/payments/recent');

    // Return the payments data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  // Articles endpoints
  async getArticles() {
    const response = await this.request('/articles');

    // Return the articles data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getArticle(id: number) {
    const response = await this.request(`/articles/${id}`);
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async createArticle(articleData: {
    title: string;
    content: string;
    category_id: number;
    featured_image_id?: number;
  }) {
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData)
    }) as any;
  }

  async updateArticle(id: number, articleData: unknown) {
    return this.request(`/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(articleData)
    }) as any;
  }

  async deleteArticle(id: number) {
    return this.request(`/articles/${id}`, {
      method: 'DELETE'
    }) as any;
  }

  async getArticleCategories() {
    const response = await this.request('/articles/categories');

    // Return the categories data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getArticleTags() {
    const response = await this.request('/articles/tags');

    // Return the tags data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getPayments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    uuid?: string;
    transaction_ref?: string;
    status?: string;
    academy_id?: number;
    course_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    if (params?.transaction_ref)
      queryParams.append('transaction_ref', params.transaction_ref);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.academy_id)
      queryParams.append('academy_id', String(params.academy_id));
    if (params?.course_id)
      queryParams.append('course_id', String(params.course_id));
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const query = queryParams.toString();
    const response = await this.request(`/payments${query ? `?${query}` : ''}`);
    return response.data || [];
  }

  async getTransactionTracking(params?: {
    page?: number;
    limit?: number;
    search?: string;
    uuid?: string;
    transaction_ref?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    if (params?.transaction_ref) {
      queryParams.append('transaction_ref', params.transaction_ref);
    }
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    const response = await this.request(
      `/payments/transactions${query ? `?${query}` : ''}`
    );
    return response.data || [];
  }

  async getTransactionTrackingById(id: string) {
    const response = await this.request(`/payments/transactions/${id}`);
    return response.data || null;
  }
  async getCurrentUser(): Promise<UserType | null> {
    const response = await this.request('/auth/me');
    return (response.data as UserType) || null;
  }

  // Enrollments endpoints
  async getEnrollments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    course_id?: string;
    user_id?: string;
    academy_id?: number;
  }): Promise<EnrollmentListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/enrollments?${queryString}` : '/enrollments';

    const response = await this.request<
      | Enrollment[]
      | EnrollmentListResponse
      | { data: Enrollment[] | EnrollmentListResponse }
    >(url);
    const payload = unwrapDataEnvelope(response.data);
    return Array.isArray(payload) ? { enrollments: payload } : payload;
  }

  async getEnrollment(id: number) {
    const response = await this.request(`/enrollments/${id}`);

    // Return the enrollment data directly
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async createEnrollment(enrollmentData: {
    user_id: number;
    course_id: number;
    status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  }) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify(enrollmentData)
    });
  }

  async updateEnrollment(
    id: number,
    enrollmentData: {
      status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    }
  ) {
    return this.request(`/enrollments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(enrollmentData)
    });
  }

  async deleteEnrollment(id: number) {
    return this.request(`/enrollments/${id}`, {
      method: 'DELETE'
    });
  }

  // Profiles endpoints (for getting all profiles)
  async getProfiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    academy_id?: number;
    is_active?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/profiles?${queryString}` : '/profiles';

    const response = await this.request(url);
    const payload = response.data as any;

    if (payload?.status === 'ok' && payload?.data) {
      return payload.data;
    }

    return payload;
  }

  async getProfile(id: number) {
    const response = await this.request(`/profiles/${id}`);

    // Return the profile data directly
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async deleteProfile(id: number) {
    return this.request(`/profiles/${id}`, {
      method: 'DELETE'
    });
  }

  // Profile password management
  async changeProfilePassword(data: {
    profile_id: number;
    current_password: string;
    new_password: string;
    confirm_new_password: string;
    user_id?: number;
  }) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getCurrentThemeConfig() {
    const response = await this.request('/theme/current/config');
    return response.data;
  }

  async updateCurrentThemeConfig(payload: {
    primary_color?: string;
    primary_color_light?: string;
    primary_color_dark?: string;
    secondary_color?: string;
    secondary_color_light?: string;
    secondary_color_dark?: string;
    accent_color?: string;
    background_color?: string;
    background_color_light?: string;
    background_color_dark?: string;
    dark_mode?: boolean | null;
    name?: string;
    background_animation_type?: string;
    background_animation_speed?: string;
    background_svg_pattern?: string;
    element_animation_style?: string;
    border_radius_style?: string;
    shadow_style?: string;
  }) {
    const response = await this.request('/theme/current/config', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  async saveThemeDraft(payload: {
    primary_color?: string;
    primary_color_light?: string;
    primary_color_dark?: string;
    secondary_color?: string;
    secondary_color_light?: string;
    secondary_color_dark?: string;
    accent_color?: string;
    background_color?: string;
    background_color_light?: string;
    background_color_dark?: string;
    dark_mode?: boolean | null;
    name?: string;
    background_animation_type?: string;
    background_animation_speed?: string;
    background_svg_pattern?: string;
    element_animation_style?: string;
    border_radius_style?: string;
    shadow_style?: string;
    section_spacing?: 'compact' | 'comfortable' | 'spacious';
    container_width?: 'narrow' | 'standard' | 'wide' | 'full';
    heading_scale?: 'compact' | 'standard' | 'large';
    font_family?: string;
    text_direction?: 'ltr' | 'rtl';
  }) {
    const response = await this.request('/theme/current/config/draft', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  async publishThemeConfig() {
    const response = await this.request('/theme/current/config/publish', {
      method: 'POST'
    });
    return response.data;
  }

  async getUserProfiles() {
    return this.request('/auth/profiles', {
      method: 'POST'
    });
  }

  // UI Template endpoints
  async getCurrentUITemplate() {
    const response = await this.request('/ui-template/current');
    return (response.data as any)?.data ?? null;
  }

  async createUITemplate(payload: {
    blocks: Array<{
      id: string;
      type: string;
      order: number;
      isVisible: boolean;
      config?: Record<string, any>;
    }>;
    is_active?: boolean;
  }) {
    const response = await this.request('/ui-template/current', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return (response.data as any)?.data ?? null;
  }

  async updateUITemplate(payload: {
    blocks?: Array<{
      id: string;
      type: string;
      order: number;
      isVisible: boolean;
      config?: Record<string, any>;
    }>;
    template_preset?: string | null;
    is_active?: boolean;
  }) {
    const response = await this.request('/ui-template/current', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return (response.data as any)?.data ?? null;
  }

  async saveUITemplateDraft(payload: {
    blocks?: Array<{
      id: string;
      type: string;
      order: number;
      isVisible: boolean;
      config?: Record<string, unknown>;
    }>;
    template_preset?: string | null;
    is_active?: boolean;
  }) {
    const response = await this.request('/ui-template/current/draft', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return (response.data as any)?.data ?? null;
  }

  async publishUITemplate() {
    const response = await this.request('/ui-template/current/publish', {
      method: 'POST'
    });
    return (response.data as any)?.data ?? null;
  }

  async publishSite() {
    const response = await this.request('/ui-template/current/publish-site', {
      method: 'POST'
    });
    return response.data;
  }

  async createTemplatePreviewToken() {
    const response = await this.request('/ui-template/preview-token', {
      method: 'POST'
    });
    return response.data as { token: string; expiresIn: string };
  }

  async getTemplatePreviewSession() {
    const response = await this.request<{
      token: string;
      expiresIn: string;
      academySlug: string;
      previewPath: string;
      storefrontBaseUrl: string | null;
    }>('/ui-template/preview-session');
    return response.data;
  }

  async getAvailableTemplatePresets() {
    const response = await this.request('/ui-template/presets');
    const data = (response.data as any)?.data;
    return Array.isArray(data) ? data : [];
  }

  async applyTemplatePreset(presetId: string) {
    const response = await this.request(`/ui-template/presets/${presetId}`, {
      method: 'POST'
    });
    return (response.data as any)?.data ?? null;
  }

  async generateTemplate(payload: { field: string; presetId?: string }) {
    const response = await this.request('/ui-template/current/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return (response.data as any)?.data ?? null;
  }

  async createDedicatedTemplate(payload: {
    name: string;
    description?: string;
    preview?: string;
    blocks: unknown[];
  }) {
    const response = await this.request('/ui-template/templates', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return (response.data as any)?.data ?? null;
  }

  async saveDraftAsTemplate(payload: {
    name: string;
    description?: string;
    preview?: string;
  }) {
    const response = await this.request(
      '/ui-template/current/save-as-template',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    return (response.data as { data?: unknown })?.data ?? null;
  }

  async deleteDedicatedTemplate(key: string) {
    const response = await this.request(`/ui-template/templates/${key}`, {
      method: 'DELETE'
    });
    return (response.data as any) ?? null;
  }

  async getSectionCatalog() {
    const response = await this.request('/ui-template/sections');
    const data = (response.data as { data?: unknown })?.data;
    return Array.isArray(data) ? data : [];
  }

  async overridePublicTemplate(
    key: string,
    payload: { blocks: unknown[]; preview?: string }
  ) {
    const response = await this.request(`/ui-template/templates/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return (response.data as any) ?? null;
  }

  async setOwnedTemplateCover(image: string) {
    const response = await this.request(
      '/ui-template/current/dedicated/cover',
      { method: 'PATCH', body: JSON.stringify({ image }) }
    );
    return (response.data as any) ?? null;
  }

  async setTemplateCover(key: string, image: string) {
    const response = await this.request(`/ui-template/templates/${key}/cover`, {
      method: 'PATCH',
      body: JSON.stringify({ image })
    });
    return (response.data as any) ?? null;
  }

  async setSectionCover(key: string, blockId: string, image: string) {
    const response = await this.request(
      `/ui-template/templates/${key}/sections/${blockId}/cover`,
      {
        method: 'PATCH',
        body: JSON.stringify({ image })
      }
    );
    return (response.data as any) ?? null;
  }

  async setTemplateVisibility(key: string, visibility: 'PUBLIC' | 'DEDICATED') {
    const response = await this.request(
      `/ui-template/templates/${key}/visibility`,
      {
        method: 'PATCH',
        body: JSON.stringify({ visibility })
      }
    );
    return (response.data as any) ?? null;
  }

  async importSectionToDraft(payload: { presetId: string; blockId: string }) {
    const response = await this.request('/ui-template/current/draft/sections', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return (response.data as { data?: unknown })?.data ?? null;
  }

  async swapSectionInDraft(
    blockId: string,
    payload: { presetId: string; blockId: string }
  ) {
    const response = await this.request(
      `/ui-template/current/draft/sections/${blockId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
    return (response.data as { data?: unknown })?.data ?? null;
  }

  async getCurrentPricingConfig() {
    const response = await this.request('/academies/current/pricing-config');
    return response.data;
  }

  async updateCurrentPricingConfig(payload: {
    title?: string;
    subtitle?: string;
    cta_label?: string;
  }) {
    const response = await this.request('/academies/current/pricing-config', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  // Discounts endpoints
  async getDiscounts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    academy_id?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (params?.academy_id)
      queryParams.append('academy_id', params.academy_id.toString());

    const query = queryParams.toString();
    const response = await this.request<any>(
      `/discounts${query ? `?${query}` : ''}`
    );

    // Backend returns { message, status, data: { discounts, pagination } }
    // API client wraps it in { data: { message, status, data } }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  async getDiscountById(id: number) {
    const response = await this.request<any>(`/discounts/${id}`);

    // Backend returns { message, status, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  async createDiscount(discountData: {
    code: string;
    description?: string;
    discount_type: 'PERCENT' | 'FIXED';
    discount_value: number;
    academy_id?: number;
    usage_limit?: number;
    usage_type: 'ONE_TIME' | 'LIMITED' | 'UNLIMITED' | 'USER_SPECIFIC';
    start_date: string;
    end_date: string;
    is_active?: boolean;
    min_purchase_amount?: number;
    max_discount_amount?: number;
  }) {
    const response = await this.request<any>('/discounts', {
      method: 'POST',
      body: JSON.stringify(discountData)
    });

    // Backend returns { message, status, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  async updateDiscount(
    id: number,
    discountData: {
      description?: string;
      discount_type?: 'PERCENT' | 'FIXED';
      discount_value?: number;
      usage_limit?: number;
      usage_type?: 'ONE_TIME' | 'LIMITED' | 'UNLIMITED' | 'USER_SPECIFIC';
      start_date?: string;
      end_date?: string;
      is_active?: boolean;
      min_purchase_amount?: number;
      max_discount_amount?: number;
    }
  ) {
    const response = await this.request<any>(`/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(discountData)
    });

    // Backend returns { message, status, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  async deleteDiscount(id: number) {
    const response = await this.request<any>(`/discounts/${id}`, {
      method: 'DELETE'
    });

    // Backend returns { message, status }
    return response.data as any;
  }

  async validateDiscount(code: string, amount: number, user_id?: number) {
    const response = await this.request<any>('/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount, user_id })
    });

    // Backend returns { message, status, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  // ============================================================================
  // FINANCIAL MANAGEMENT API METHODS
  // ============================================================================

  // Cost Categories
  async getCostCategories() {
    const response = await this.request<any>('/financial/cost-categories', {
      method: 'GET'
    });
    return response.data as any[];
  }

  async createCostCategory(data: {
    name: string;
    description?: string;
    is_active?: boolean;
  }) {
    const response = await this.request<any>('/financial/cost-categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data as any;
  }

  async updateCostCategory(
    id: number,
    data: Partial<{ name: string; description?: string; is_active?: boolean }>
  ) {
    const response = await this.request<any>(
      `/financial/cost-categories/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
    return response.data as any;
  }

  async deleteCostCategory(id: number) {
    const response = await this.request<any>(
      `/financial/cost-categories/${id}`,
      {
        method: 'DELETE'
      }
    );
    return response.data as any;
  }

  async getAcademyFinancialRecords(params?: {
    academy_id?: number;
    cost_category_id?: number;
    period_start?: string;
    period_end?: string;
    year?: number;
    month?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id)
      queryParams.append('academy_id', params.academy_id.toString());
    if (params?.cost_category_id)
      queryParams.append(
        'cost_category_id',
        params.cost_category_id.toString()
      );
    if (params?.period_start)
      queryParams.append('period_start', params.period_start);
    if (params?.period_end) queryParams.append('period_end', params.period_end);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());

    const url = `/financial/academy-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any[];
  }

  async getAcademyFinancialSummary(academyId?: number) {
    const url = `/financial/academy-records/summary${academyId ? `?academy_id=${academyId}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any;
  }

  async getAcademyRevenueFromPayments(
    academyId?: number,
    startDate?: string,
    endDate?: string
  ) {
    const queryParams = new URLSearchParams();
    if (academyId) queryParams.append('academy_id', academyId.toString());
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const url = `/financial/academy/revenue${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any;
  }

  async getMonetizationSummary(params?: {
    academy_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id) {
      queryParams.append('academy_id', params.academy_id.toString());
    }
    if (params?.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params?.end_date) {
      queryParams.append('end_date', params.end_date);
    }

    const url = `/financial/monetization/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any;
  }

  async getIranSettlementStatement(params?: {
    academy_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id) {
      queryParams.append('academy_id', params.academy_id.toString());
    }
    if (params?.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params?.end_date) {
      queryParams.append('end_date', params.end_date);
    }
    const url = `/financial/settlement${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as any).data;
    }
    return response.data as any;
  }

  async getAcademySettlementTable(params?: {
    page?: number;
    limit?: number;
    search?: string;
    uuid?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    const url = `/financial/academies/settlement-table${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    if ((response.data as any)?.data) return (response.data as any).data;
    return response.data as any;
  }

  async getAcademySettlementDetail(academyId: number) {
    const response = await this.request<any>(
      `/financial/academies/${academyId}/settlement`,
      { method: 'GET' }
    );
    if ((response.data as any)?.data) return (response.data as any).data;
    return response.data as any;
  }

  async settleAcademy(
    academyId: number,
    payload: {
      bank_transaction_code: string;
      amount?: number;
      note?: string;
    }
  ) {
    const response = await this.request<any>(
      `/financial/academies/${academyId}/settle`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    if ((response.data as any)?.data) return (response.data as any).data;
    return response.data as any;
  }

  async getIranSettlementReconciliation(params?: {
    academy_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id)
      queryParams.append('academy_id', params.academy_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const url = `/financial/settlement/reconciliation${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any;
  }

  async lockIranFinancialPeriod(data: {
    academy_id: number;
    lock_until: string;
  }) {
    const response = await this.request<any>('/financial/settlement/lock', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data as any;
  }

  async setTeacherRevenueVisibility(data: {
    academy_id: number;
    teacher_id: number;
    is_visible: boolean;
  }) {
    const response = await this.request<any>(
      '/financial/teacher-revenue-visibility',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return response.data as any;
  }

  async exportIranSettlementCsv(params?: {
    academy_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.academy_id)
      queryParams.append('academy_id', params.academy_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const endpoint = `/financial/settlement/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to export CSV: ${response.status}`);
    }

    return response.blob();
  }

  async getAcademyFinancialOverview(
    academyId?: number,
    startDate?: string,
    endDate?: string
  ) {
    const queryParams = new URLSearchParams();
    if (academyId) queryParams.append('academy_id', academyId.toString());
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const url = `/financial/academy/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any;
  }

  async createAcademyFinancialRecord(data: {
    academy_id: number;
    cost_category_id?: number;
    period_start: string;
    period_end: string;
    revenue: number;
    cost: number;
    currency?: string;
    notes?: string;
  }) {
    const response = await this.request<any>('/financial/academy-records', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data as any;
  }

  async updateAcademyFinancialRecord(
    id: number,
    data: Partial<{
      academy_id?: number;
      cost_category_id?: number;
      period_start?: string;
      period_end?: string;
      revenue?: number;
      cost?: number;
      currency?: string;
      notes?: string;
    }>
  ) {
    const response = await this.request<any>(
      `/financial/academy-records/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
    return response.data as any;
  }

  async deleteAcademyFinancialRecord(id: number) {
    const response = await this.request<any>(
      `/financial/academy-records/${id}`,
      {
        method: 'DELETE'
      }
    );
    return response.data as any;
  }

  // Platform Financial Records
  async getPlatformFinancialRecords(params?: {
    cost_category_id?: number;
    period_start?: string;
    period_end?: string;
    year?: number;
    month?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.cost_category_id)
      queryParams.append(
        'cost_category_id',
        params.cost_category_id.toString()
      );
    if (params?.period_start)
      queryParams.append('period_start', params.period_start);
    if (params?.period_end) queryParams.append('period_end', params.period_end);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());

    const url = `/financial/platform-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any[];
  }

  async getPlatformFinancialSummary() {
    const response = await this.request<any>(
      '/financial/platform-records/summary',
      {
        method: 'GET'
      }
    );
    return response.data as any;
  }

  async createPlatformFinancialRecord(data: {
    cost_category_id?: number;
    period_start: string;
    period_end: string;
    revenue: number;
    cost: number;
    currency?: string;
    notes?: string;
  }) {
    const response = await this.request<any>('/financial/platform-records', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data as any;
  }

  async updatePlatformFinancialRecord(
    id: number,
    data: Partial<{
      cost_category_id?: number;
      period_start?: string;
      period_end?: string;
      revenue?: number;
      cost?: number;
      currency?: string;
      notes?: string;
    }>
  ) {
    const response = await this.request<any>(
      `/financial/platform-records/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
    return response.data as any;
  }

  async deletePlatformFinancialRecord(id: number) {
    const response = await this.request<any>(
      `/financial/platform-records/${id}`,
      {
        method: 'DELETE'
      }
    );
    return response.data as any;
  }

  // Financial Formulas
  async getFinancialFormulas(scope?: string) {
    const url = `/financial/formulas${scope ? `?scope=${scope}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any[];
  }

  async getFinancialFormula(id: number) {
    const response = await this.request<any>(`/financial/formulas/${id}`, {
      method: 'GET'
    });
    return response.data as any;
  }

  async createFinancialFormula(data: {
    name: string;
    description?: string;
    template:
      | 'SIMPLE'
      | 'PERCENTAGE_OF'
      | 'FIXED_AMOUNT'
      | 'PERCENTAGE_BONUS'
      | 'CUSTOM';
    steps: Array<{
      operation:
        | 'ADD'
        | 'SUBTRACT'
        | 'MULTIPLY'
        | 'DIVIDE'
        | 'PERCENTAGE'
        | 'FIXED';
      value?: number | string;
      variable?: 'REVENUE' | 'COST' | 'PROFIT' | 'FINAL_PROFIT';
      percentage?: number;
    }>;
    type: 'REVENUE' | 'COST' | 'BENEFIT';
    scope: 'STORE' | 'PLATFORM';
    is_active?: boolean;
  }) {
    const response = await this.request<any>('/financial/formulas', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.data as any;
  }

  async updateFinancialFormula(
    id: number,
    data: Partial<{
      name?: string;
      description?: string;
      template?:
        | 'SIMPLE'
        | 'PERCENTAGE_OF'
        | 'FIXED_AMOUNT'
        | 'PERCENTAGE_BONUS'
        | 'CUSTOM';
      steps?: Array<{
        operation:
          | 'ADD'
          | 'SUBTRACT'
          | 'MULTIPLY'
          | 'DIVIDE'
          | 'PERCENTAGE'
          | 'FIXED';
        value?: number | string;
        variable?: 'REVENUE' | 'COST' | 'PROFIT' | 'FINAL_PROFIT';
        percentage?: number;
      }>;
      type?: 'REVENUE' | 'COST' | 'BENEFIT';
      is_active?: boolean;
    }>
  ) {
    const response = await this.request<any>(`/financial/formulas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.data as any;
  }

  async deleteFinancialFormula(id: number) {
    const response = await this.request<any>(`/financial/formulas/${id}`, {
      method: 'DELETE'
    });
    return response.data as any;
  }

  async executeFormula(name: string, variables: Record<string, any>) {
    const response = await this.request<any>(
      `/financial/formulas/${name}/execute`,
      {
        method: 'POST',
        body: JSON.stringify(variables)
      }
    );
    return response.data as { result: number };
  }

  // Formula Applications
  async createFormulaApplication(data: {
    formula_id: number;
    academy_id?: number;
    period_start: string;
    period_end: string;
    adjustment_type: 'AUTOMATIC' | 'MANUAL' | 'GIFT' | 'INCENTIVE';
    adjustment_amount?: number;
    adjustment_percent?: number;
    reason?: string;
    apply_immediately?: boolean;
  }) {
    const response = await this.request<any>(
      '/financial/formula-applications',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return response.data as any;
  }

  async getFormulaApplications(params?: {
    academy_id?: number;
    formula_id?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id)
      queryParams.append('academy_id', params.academy_id.toString());
    if (params?.formula_id)
      queryParams.append('formula_id', params.formula_id.toString());

    const url = `/financial/formula-applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any[];
  }

  async applyFormulaApplication(id: number) {
    const response = await this.request<any>(
      `/financial/formula-applications/${id}/apply`,
      {
        method: 'POST'
      }
    );
    return response.data as any;
  }

  async deleteFormulaApplication(id: number) {
    const response = await this.request<any>(
      `/financial/formula-applications/${id}`,
      {
        method: 'DELETE'
      }
    );
    return response.data as any;
  }

  // ============================================================================
  // DATABASE DASHBOARD API METHODS
  // ============================================================================

  async getDatabaseModels() {
    const response = await this.request<any>('/database/models', {
      method: 'GET'
    });
    return response.data as string[];
  }

  async getModelFields(modelName: string) {
    const response = await this.request<any>(
      `/database/models/${modelName}/fields`,
      {
        method: 'GET'
      }
    );
    return response.data as { fields: any[]; sample: any };
  }

  async getModelRecords(
    modelName: string,
    params?: {
      page?: number;
      limit?: number;
      where?: string;
      orderBy?: string;
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.where) queryParams.append('where', params.where);
    if (params?.orderBy) queryParams.append('orderBy', params.orderBy);

    const url = `/database/models/${modelName}/records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as {
      data: any[];
      total: number;
      page: number;
      limit: number;
    };
  }

  async getModelRecord(modelName: string, id: number) {
    const response = await this.request<any>(
      `/database/models/${modelName}/records/${id}`,
      {
        method: 'GET'
      }
    );
    return response.data as any;
  }

  async createModelRecord(modelName: string, data: any) {
    const response = await this.request<any>(
      `/database/models/${modelName}/records`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return response.data as any;
  }

  async updateModelRecord(modelName: string, id: number, data: any) {
    const response = await this.request<any>(
      `/database/models/${modelName}/records/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
    return response.data as any;
  }

  async deleteModelRecord(modelName: string, id: number) {
    const response = await this.request<any>(
      `/database/models/${modelName}/records/${id}`,
      {
        method: 'DELETE'
      }
    );
    return response.data as any;
  }

  // ─── Assignments ───────────────────────────────────────────────────────────

  async getAssignments(params?: {
    page?: number;
    limit?: number;
    lesson_id?: number;
    course_id?: number;
  }): Promise<AssignmentListResponse> {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const url = qs.toString() ? `/assignments?${qs}` : '/assignments';
    const res = await this.request<
      AssignmentListResponse | { data: AssignmentListResponse }
    >(url);
    return unwrapDataEnvelope(res.data);
  }

  async createAssignment(data: {
    lesson_id: number;
    title: string;
    description?: string;
    due_date?: string;
    max_score?: number;
    is_required?: boolean;
  }): Promise<LearningAssignment> {
    const res = await this.request<
      LearningAssignment | { data: LearningAssignment }
    >('/assignments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return unwrapDataEnvelope(res.data);
  }

  async updateAssignment(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      due_date: string;
      max_score: number;
      is_required: boolean;
    }>
  ): Promise<LearningAssignment> {
    const res = await this.request<
      LearningAssignment | { data: LearningAssignment }
    >(`/assignments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return unwrapDataEnvelope(res.data);
  }

  async getSubmissions(params?: {
    page?: number;
    limit?: number;
    assignment_id?: number;
    profile_id?: number;
    enrollment_id?: number;
    status?: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'REJECTED';
  }): Promise<SubmissionListResponse> {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const url = qs.toString()
      ? `/assignments/submissions?${qs}`
      : '/assignments/submissions';
    const res = await this.request<
      SubmissionListResponse | { data: SubmissionListResponse }
    >(url);
    return unwrapDataEnvelope(res.data);
  }

  async gradeSubmission(
    submissionId: number,
    data: { score: number; feedback?: string }
  ): Promise<AssignmentSubmission> {
    const res = await this.request<
      AssignmentSubmission | { data: AssignmentSubmission }
    >(`/assignments/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return unwrapDataEnvelope(res.data);
  }

  // ─── Learning record ───────────────────────────────────────────────────────

  async getLearningTimeline(params?: {
    profile_id?: string;
    enrollment_id?: string;
    course_id?: string;
    page?: number;
    limit?: number;
  }): Promise<LearningTimelineResponse> {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) qs.append(key, String(value));
      });
    }
    const url = qs.toString()
      ? `/learning-record/timeline?${qs}`
      : '/learning-record/timeline';
    const res = await this.request<
      LearningTimelineResponse | { data: LearningTimelineResponse }
    >(url);
    return unwrapDataEnvelope(res.data);
  }

  async getLearningSummary(params?: {
    profile_id?: string;
    course_id?: string;
  }): Promise<LearningSummaryResponse> {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) qs.append(key, String(value));
      });
    }
    const url = qs.toString()
      ? `/learning-record/summary?${qs}`
      : '/learning-record/summary';
    const res = await this.request<
      LearningSummaryResponse | { data: LearningSummaryResponse }
    >(url);
    return unwrapDataEnvelope(res.data);
  }

  async getLearningOpsQueue(params?: {
    course_id?: string;
    inactive_days?: number;
    low_score_threshold?: number;
  }): Promise<OpsQueueResponse> {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) qs.append(key, String(value));
      });
    }
    const url = qs.toString()
      ? `/learning-record/ops/queue?${qs}`
      : '/learning-record/ops/queue';
    const res = await this.request<
      OpsQueueResponse | { data: OpsQueueResponse }
    >(url);
    return unwrapDataEnvelope(res.data);
  }

  async createInterventionNote(data: {
    profile_id: string;
    note: string;
    follow_up_at?: string;
    course_id?: string;
    enrollment_id?: string;
  }): Promise<{ id: string; created_at: string }> {
    const res = await this.request<
      | { id: string; created_at: string }
      | { data: { id: string; created_at: string } }
    >('/learning-record/ops/intervention-notes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return unwrapDataEnvelope(res.data);
  }

  // ─── Tutoring ──────────────────────────────────────────────────────────────

  async createTutoringOffer(
    data: CreateTutoringOfferPayload
  ): Promise<TutoringOffer> {
    const res = await this.request<TutoringOffer | { data: TutoringOffer }>(
      '/tutoring/offers',
      { method: 'POST', body: JSON.stringify(data) }
    );
    return unwrapDataEnvelope(res.data);
  }

  async createTutoringEngagement(
    data: CreateTutoringEngagementPayload
  ): Promise<TutoringEngagement> {
    const res = await this.request<
      TutoringEngagement | { data: TutoringEngagement }
    >('/tutoring/engagements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return unwrapDataEnvelope(res.data);
  }

  async getTutoringEngagements(params?: {
    course_id?: string;
  }): Promise<TutoringEngagement[]> {
    const qs = new URLSearchParams();
    if (params?.course_id) qs.append('course_id', params.course_id);
    const url = qs.toString()
      ? `/tutoring/engagements?${qs}`
      : '/tutoring/engagements';
    const res = await this.request<
      TutoringEngagement[] | { data: TutoringEngagement[] }
    >(url);
    const payload = unwrapDataEnvelope(res.data);
    return Array.isArray(payload) ? payload : [];
  }

  async updateLessonDownloadPolicy(
    lessonId: string,
    data: UpdateLessonDownloadPolicyPayload
  ): Promise<LessonDownloadPolicy> {
    const res = await this.request<
      LessonDownloadPolicy | { data: LessonDownloadPolicy }
    >(`/tutoring/lessons/${lessonId}/download-policy`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return unwrapDataEnvelope(res.data);
  }

  async scheduleTutoringSession(
    data: ScheduleTutoringSessionPayload
  ): Promise<TutoringSession> {
    const res = await this.request<TutoringSession | { data: TutoringSession }>(
      '/tutoring/sessions',
      { method: 'POST', body: JSON.stringify(data) }
    );
    return unwrapDataEnvelope(res.data);
  }

  async rescheduleTutoringSession(
    sessionId: string,
    data: RescheduleTutoringSessionPayload
  ): Promise<TutoringSession> {
    const res = await this.request<TutoringSession | { data: TutoringSession }>(
      `/tutoring/sessions/${sessionId}/reschedule`,
      { method: 'PATCH', body: JSON.stringify(data) }
    );
    return unwrapDataEnvelope(res.data);
  }

  async cancelTutoringSession(
    sessionId: string,
    data?: { reason?: string }
  ): Promise<TutoringSession> {
    const res = await this.request<TutoringSession | { data: TutoringSession }>(
      `/tutoring/sessions/${sessionId}/cancel`,
      { method: 'PATCH', body: JSON.stringify(data ?? {}) }
    );
    return unwrapDataEnvelope(res.data);
  }

  async markTutoringAttendance(
    sessionId: string,
    data: { profile_id: string; status?: TutoringAttendanceStatus }
  ): Promise<unknown> {
    const res = await this.request(
      `/tutoring/sessions/${sessionId}/attendance`,
      { method: 'POST', body: JSON.stringify(data) }
    );
    return unwrapDataEnvelope(res.data);
  }

  // ─── Manual Enrollment ─────────────────────────────────────────────────────

  async manualEnroll(data: {
    course_id: number;
    profile_id: number;
    payment_note?: string;
    paid_amount?: number;
  }) {
    const res = await this.request('/enrollments/manual', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  // ─── Student Lesson Access ─────────────────────────────────────────────────

  async getStudentLessonAccess(params?: {
    profile_id?: number;
    lesson_id?: number;
    course_id?: number;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const url = qs.toString()
      ? `/student-lesson-access?${qs}`
      : '/student-lesson-access';
    const res = await this.request(url);
    const payload = res.data as any;
    return payload?.data ?? payload;
  }

  async upsertStudentLessonAccess(data: {
    profile_id: number;
    lesson_id: number;
    is_unlocked: boolean;
    note?: string;
  }) {
    const res = await this.request('/student-lesson-access', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async deleteStudentLessonAccess(id: number) {
    const res = await this.request(`/student-lesson-access/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }

  // -------------------------------------------------------------------------
  // Platform Settings
  // -------------------------------------------------------------------------

  async getPlatformSettings() {
    const res = await this.request<PlatformSettingsData>('/platform-settings');
    return (res.data as any)?.data ?? res.data;
  }

  async updatePlatformSettings(data: Partial<PlatformSettingsData>) {
    const res = await this.request<PlatformSettingsData>('/platform-settings', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getSubscriptionPlans() {
    const res = await this.request<SubscriptionPlanData[]>(
      '/platform-settings/plans'
    );
    return (res.data as any)?.data ?? res.data;
  }

  // No auth guard — safe for MANAGER / TEACHER
  async getActivePlans() {
    const res = await this.request<SubscriptionPlanData[]>(
      '/platform-settings/plans/active'
    );
    return (res.data as any)?.data ?? res.data;
  }

  async createSubscriptionPlan(
    data: Omit<SubscriptionPlanData, 'id' | 'created_at' | 'updated_at'>
  ) {
    const res = await this.request<SubscriptionPlanData>(
      '/platform-settings/plans',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return (res.data as any)?.data ?? res.data;
  }

  async updateSubscriptionPlan(
    id: string,
    data: Partial<SubscriptionPlanData>
  ) {
    const res = await this.request<SubscriptionPlanData>(
      `/platform-settings/plans/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
    return (res.data as any)?.data ?? res.data;
  }

  async deleteSubscriptionPlan(id: string) {
    const res = await this.request(`/platform-settings/plans/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }

  // -------------------------------------------------------------------------
  // Payment Gateway Config (Admin)
  // -------------------------------------------------------------------------

  async listGatewayConfigs() {
    const res = await this.request('/payments/gateways/configs');
    const payload = res.data as any;
    return payload?.data ?? payload;
  }

  async updateGatewayConfig(
    id: number,
    data: {
      token?: string;
      is_active?: boolean;
      extra?: Record<string, unknown>;
    }
  ) {
    const res = await this.request(`/payments/gateways/${id}/config`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async ensurePayPingGateway() {
    const res = await this.request('/payments/gateways/payping/ensure', {
      method: 'POST'
    });
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Stores (platform-level academy management)
  // -------------------------------------------------------------------------

  async getStores(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const res = await this.request<any>(
      `/stores${qs.toString() ? `?${qs}` : ''}`
    );
    return (res.data as any)?.data ?? res.data;
  }

  async getStore(id: number) {
    const res = await this.request<any>(`/academies/${id}`);
    return (res.data as any)?.data ?? res.data;
  }

  async createStore(data: {
    name: string;
    slug: string;
    country?: string;
    is_active?: boolean;
  }) {
    const res = await this.request<any>('/academies', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updateStore(
    id: number,
    data: Partial<{
      name: string;
      slug: string;
      country: string;
      is_active: boolean;
    }>
  ) {
    const res = await this.request<any>(`/academies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updateAcademyCommissionRate(id: number, commission_rate: number) {
    const res = await this.request<any>(
      `/financial/academies/${id}/commission-rate`,
      {
        method: 'PATCH',
        body: JSON.stringify({ commission_rate })
      }
    );
    return (res.data as any)?.data ?? res.data;
  }

  async getAcademyWallet(academyId: number) {
    const res = await this.request<any>(
      `/financial/academies/${academyId}/wallet`
    );
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Store Settings (webhooks)
  // -------------------------------------------------------------------------

  async getStoreSettings(academyId: number) {
    const res = await this.request<any>(`/academies/${academyId}/settings`);
    return (res.data as any)?.data ?? res.data;
  }

  async setStoreSetting(academyId: number, key: string, value: string) {
    const res = await this.request<any>(`/academies/${academyId}/settings`, {
      method: 'POST',
      body: JSON.stringify({ key, value })
    });
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Payment Plans
  // -------------------------------------------------------------------------

  async getPaymentPlans(courseId: number) {
    const res = await this.request<any>(`/payment-plans/courses/${courseId}`);
    return (res.data as any)?.data ?? res.data;
  }

  async createPaymentPlan(
    courseId: number,
    data: {
      installment_count: number;
      amount_per_installment: number;
      interval_days: number;
    }
  ) {
    const res = await this.request<any>(`/payment-plans/courses/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updatePaymentPlan(
    id: number,
    data: Partial<{
      is_active: boolean;
      amount_per_installment: number;
      interval_days: number;
    }>
  ) {
    const res = await this.request<any>(`/payment-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Bundles
  // -------------------------------------------------------------------------

  async getBundles(params?: {
    academy_id?: number;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const res = await this.request<any>(
      `/bundles${qs.toString() ? `?${qs}` : ''}`
    );
    return (res.data as any)?.data ?? res.data;
  }

  async getBundle(id: number) {
    const res = await this.request<any>(`/bundles/${id}`);
    return (res.data as any)?.data ?? res.data;
  }

  async createBundle(data: {
    academy_id: number;
    title: string;
    slug: string;
    price: number;
    course_ids: number[];
    description?: string;
  }) {
    const res = await this.request<any>('/bundles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updateBundle(
    id: number,
    data: Partial<{
      title: string;
      slug: string;
      price: number;
      course_ids: number[];
      description: string;
      is_active: boolean;
    }>
  ) {
    const res = await this.request<any>(`/bundles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Refunds
  // -------------------------------------------------------------------------

  async getRefundEligibility(paymentId: number) {
    const res = await this.request<any>(`/refunds/payments/${paymentId}`);
    return (res.data as any)?.data ?? res.data;
  }

  async issueRefund(
    paymentId: number,
    data: {
      refund_amount?: number;
      reason: string;
      revoke_enrollment?: boolean;
    }
  ) {
    const res = await this.request<any>(`/refunds/payments/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Withdrawals
  // -------------------------------------------------------------------------

  async getWithdrawals(params?: {
    academy_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const res = await this.request<any>(
      `/financial/withdrawals${qs.toString() ? `?${qs}` : ''}`
    );
    return (res.data as any)?.data ?? res.data;
  }

  async approveWithdrawal(
    id: number,
    data: { bank_transaction_code: string; notes?: string }
  ) {
    const res = await this.request<any>(
      `/financial/settlement/withdrawals/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return (res.data as any)?.data ?? res.data;
  }

  async rejectWithdrawal(id: number, data: { notes?: string }) {
    const res = await this.request<any>(
      `/financial/settlement/withdrawals/${id}/reject`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Teacher Payouts
  // -------------------------------------------------------------------------

  async getTeacherPayouts(params?: {
    profile_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const res = await this.request<any>(
      `/teacher-wallet/payout-requests${qs.toString() ? `?${qs}` : ''}`
    );
    return (res.data as any)?.data ?? res.data;
  }

  async approveTeacherPayout(id: number) {
    const res = await this.request<any>(
      `/teacher-wallet/payout-requests/${id}/approve`,
      { method: 'POST' }
    );
    return (res.data as any)?.data ?? res.data;
  }

  async rejectTeacherPayout(id: number, notes?: string) {
    const res = await this.request<any>(
      `/teacher-wallet/payout-requests/${id}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ notes })
      }
    );
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Affiliates
  // -------------------------------------------------------------------------

  async checkAffiliatePhone(
    phone: string
  ): Promise<{ exists: boolean; name?: string }> {
    const res = await this.request<any>(
      `/affiliates/check-phone?phone=${encodeURIComponent(phone)}`
    );
    return res.data ?? res;
  }

  async createAffiliateAccount(data: {
    affiliate_name: string;
    phone: string;
    password?: string;
    commission_rate: number;
  }) {
    const res = await this.request<any>('/affiliates/accounts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async confirmPhoneOtp(temp_token: string, otp: string) {
    const res = await this.request<any>('/auth/confirm-phone', {
      method: 'POST',
      body: JSON.stringify({ temp_token, otp })
    });
    return res.data;
  }

  async deactivateAffiliate(id: number) {
    const res = await this.request<any>(`/affiliates/${id}/deactivate`, {
      method: 'PATCH',
      body: '{}'
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getAffiliates() {
    const res = await this.request<any>('/affiliates');
    return (res.data as any)?.data ?? res.data;
  }

  async getMyAffiliateLinks() {
    const res = await this.request<any>('/affiliates/my');
    return (res.data as any)?.data ?? res.data ?? [];
  }

  async requestAffiliateWithdrawal(linkId: number, amount: number) {
    const res = await this.request<any>(`/affiliates/my/${linkId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getAffiliateWithdrawals(status?: string) {
    const qs = status ? `?status=${status}` : '';
    const res = await this.request<any>(`/affiliates/withdrawals${qs}`);
    return (res.data as any)?.data ?? res.data ?? [];
  }

  async processAffiliateWithdrawal(id: number, status: string, notes?: string) {
    const res = await this.request<any>(`/affiliates/withdrawals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
    return (res.data as any)?.data ?? res.data;
  }

  async searchAffiliateCandidates(search: string) {
    const res = await this.request<any>(
      `/affiliates/candidates?search=${encodeURIComponent(search)}`
    );
    return (res.data as any)?.data ?? res.data ?? [];
  }

  async createAffiliate(data: {
    affiliate_name: string;
    affiliate_email?: string;
    affiliate_phone?: string;
    code?: string;
    course_id?: number;
    academy_id: number;
    commission_rate: number;
    profile_id?: number;
  }) {
    const res = await this.request<any>('/affiliates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updateAffiliate(
    id: number,
    data: Partial<{
      affiliate_name: string;
      affiliate_email: string;
      affiliate_phone: string;
      is_active: boolean;
      commission_rate: number;
    }>
  ) {
    const res = await this.request<any>(`/affiliates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async deleteAffiliate(id: number) {
    const res = await this.request<any>(`/affiliates/${id}`, {
      method: 'DELETE'
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getAffiliateStats(code: string) {
    const res = await this.request<any>(`/affiliates/${code}/stats`);
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Academy Plans & Subscriptions
  // -------------------------------------------------------------------------

  async getAcademyPlans(kind?: string) {
    const qs = kind ? `?kind=${kind}` : '';
    const res = await this.request<any>(`/academy-plans${qs}`);
    return (res.data as any)?.data ?? res.data;
  }

  async createAcademyPlan(dto: {
    kind: 'SUBSCRIPTION' | 'PACKAGE';
    name: string;
    description?: string;
    price: number;
    duration_days?: number;
  }) {
    const res = await this.request<any>('/academy-plans', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updateAcademyPlan(
    id: number,
    dto: {
      name?: string;
      description?: string;
      price?: number;
      duration_days?: number;
      is_active?: boolean;
    }
  ) {
    const res = await this.request<any>(`/academy-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto)
    });
    return (res.data as any)?.data ?? res.data;
  }

  async deleteAcademyPlan(id: number) {
    const res = await this.request<any>(`/academy-plans/${id}`, {
      method: 'DELETE'
    });
    return (res.data as any)?.data ?? res.data;
  }

  async triggerSubscriptionLifecycle() {
    const res = await this.request<any>('/subscriptions/lifecycle/tick', {
      method: 'POST'
    });
    return (res.data as any)?.data ?? res.data;
  }

  /**
   * Initiate gateway checkout for an AcademyPlan (SUBSCRIPTION or PACKAGE).
   * Returns { payment_id, redirect_url } — caller should window.location.href = redirect_url.
   */
  async initiateAcademyPlanPayment(data: {
    academy_plan_id: string;
    amount: number;
    coupon_code?: string;
    callback_url: string;
  }) {
    const res = await this.request<any>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return (res.data as any)?.data ?? res.data;
  }
}

export interface PlatformSettingsData {
  id: number;
  vat_rate: number;
  commission_rate: number;
  teacher_share_rate: number;
  storage_overage_fee_irr: number;
  subscription_grace_days: number;
  subscription_reminder_days: number;
  payment_release_phase: string;
  legal_entity_name: string | null;
  vat_registration_no: string | null;
  economic_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface StructuredPlanLimits {
  managers: number;
  teachers: number;
  courses: number;
  seasons_per_course: number;
  lessons_per_course: number;
  active_students: number;
  storage_gb: number;
  live_classes_per_month: number;
  videos: number;
}

export interface SubscriptionPlanData {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number | null;
  commission_rate: number | null;
  storage_limit_gb: number;
  features: string[] | null;
  is_active: boolean;
  sort_order: number;
  limits?: StructuredPlanLimits | null;
  is_most_popular?: boolean;
  annual_months_included?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SupportInboxQuery {
  status?: string;
  priority?: string;
  academy_id?: string;
  category?: string;
  assigned_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SupportInboxResult {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
}

export interface PlanLimitUsageEntry {
  limit: number;
  used: number;
}

export type PlanLimitUsageSnapshot = Record<string, PlanLimitUsageEntry>;

export interface AcademyHealthView {
  id: string;
  name: string;
  slug: string;
  plan_slug: string | null;
  expires_at: string | null;
  monthly_revenue?: number;
  student_count?: number;
  course_count?: number;
  open_ticket_count?: number;
  limits?: PlanLimitUsageSnapshot;
}

export interface PanelNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: PanelNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type PlatformBroadcastAudience =
  | 'ALL_MANAGERS'
  | 'ALL_TEACHERS'
  | 'SELECTED_ACADEMIES';

export interface PlatformBroadcast {
  id: string;
  title: string;
  body: string;
  audience: PlatformBroadcastAudience;
  status: 'DRAFT' | 'SENT';
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
}

export interface CreatePlatformBroadcastPayload {
  title: string;
  body: string;
  audience: PlatformBroadcastAudience;
  academy_ids?: string[];
}

function unwrapSupportInbox(res: unknown): SupportInboxResult {
  const payload = (
    res as { data?: SupportInboxResult | { data?: SupportInboxResult } }
  ).data;
  if (payload && 'items' in payload) return payload;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: SupportInboxResult }).data;
  }
  return { items: [], total: 0, page: 1, limit: 20 };
}

export interface GatewayConfigData {
  id: number;
  name: string;
  display_name: string;
  country_code: string;
  region: string;
  supported_currencies: string[];
  is_active: boolean;
  config_schema: {
    token: string | null;
    token_configured: boolean;
    terminal_id?: string;
    merchant_id?: string;
    callback_url?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface GatewayRegistryStatus {
  provider: string;
  configured: boolean;
  implemented: boolean;
}

export const apiClient = new ApiClient();
