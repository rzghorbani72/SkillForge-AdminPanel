import { HttpClient } from '../http-client';
import { ActiveSession } from '@/types/api';
import type { MemberAcademy } from '@/types/auth';
import type { LegalPendingDocumentDiff } from '../types-1';

export class ApiLayer01 extends HttpClient {
  // Auth endpoints
  /**
   * Staff login for MANAGER/TEACHER (admin panel)
   * academy_id is optional - if user has multiple stores, will return available stores for selection
   */
  async login(credentials: {
    identifier: string;
    password: string;
    academy_id?: string;
    captcha_token: string;
  }) {
    const response = this.request('/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
    academy_id: string;
    captcha_token: string;
  }) {
    const response = this.request('/auth/public/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
    captcha_token: string;
  }) {
    const response = this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
    academy_id?: string;
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
      body: JSON.stringify(userData),
    });
  }

  /**
   * Step 2 for a phone that has no panel account but belongs to an academy:
   * send the one-time code that unlocks the academy list. Membership is
   * private, so only the person holding the phone may see it.
   */
  async sendAcademyLookupOtp(phone_number: string, captcha_token: string) {
    return this.request<{ message: string }>('/auth/academies/lookup/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number, captcha_token }),
    });
  }

  /** The academies this phone belongs to, once its one-time code checks out. */
  async lookupMyAcademies(phone_number: string, otp: string) {
    return this.request<MemberAcademy[]>('/auth/academies/lookup', {
      method: 'POST',
      body: JSON.stringify({ phone_number, otp }),
    });
  }

  /** Signup pre-check so an existing account is caught before any SMS is sent. */
  async checkSignupPhone(phone_number: string) {
    return this.request<{ taken: boolean }>('/auth/register/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone_number }),
    });
  }

  async getLegalDocuments(lang?: string) {
    return this.request<{ type: string; version: string; title: string; published_at: string }[]>(
      `/legal/documents`,
      { method: 'GET' },
      true,
      lang,
    );
  }

  async getLegalDocument(type: string, lang?: string) {
    const res = await this.request<{
      title: string;
      body: string;
      version: string;
      type: string;
      locale: string;
    }>(`/legal/documents/${encodeURIComponent(type)}`, { method: 'GET' }, true, lang);
    return (res.data as { data?: typeof res.data })?.data ?? res.data;
  }

  async getLegalAcceptanceStatus(lang?: string) {
    return this.request<{
      up_to_date: boolean;
      pending: { type: string; title: string; version: string }[];
    }>(`/legal/acceptances/status`, { method: 'GET' }, true, lang);
  }

  async getLegalAcceptanceDiff(lang?: string) {
    return this.request<LegalPendingDocumentDiff[]>(
      `/legal/acceptances/diff`,
      { method: 'GET' },
      true,
      lang,
    );
  }

  async acceptPlatformLegalDocuments(lang?: string) {
    return this.request<{ accepted: string[] }>(
      `/legal/acceptances/platform`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
      true,
      lang,
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
    }>(`/legal/admin/documents/${encodeURIComponent(type)}`, { method: 'GET' }, true, lang);
    return (res.data as { data?: typeof res.data })?.data ?? res.data;
  }

  async saveLegalDraft(type: string, payload: { title: string; body: string; locale?: string }) {
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
        body: JSON.stringify({ title: payload.title, body: payload.body }),
      },
      true,
      lang,
    );
    return (res.data as { data?: typeof res.data })?.data ?? res.data;
  }

  async publishLegalDocument(type: string, payload: { version: string; locale?: string }) {
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
        body: JSON.stringify({ version: payload.version }),
      },
      true,
      lang,
    );
    return (res.data as { data?: typeof res.data })?.data ?? res.data;
  }

  async createUser(data: {
    name: string;
    phone_number: string;
    password: string;
    role: string;
    academy_id: string;
    display_name?: string;
  }) {
    return this.request('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Find a person by their full phone number. Returns their role in YOUR
   * academy only — never where else on the platform they belong.
   */
  async lookupPersonByPhone(phone: string) {
    const res = await this.request<{
      found: boolean;
      user_id: string | null;
      name: string | null;
      membership: { role: string; is_active: boolean } | null;
    }>(`/users/lookup?phone=${encodeURIComponent(phone)}`);
    return res.data;
  }

  /**
   * Add a person to your academy. An existing account gains a membership here;
   * an unknown number gets a new account. The backend stamps the caller as the
   * creator, which is what later lets a teacher hand their own courses to this
   * person.
   */
  async addAcademyMember(data: {
    phone_number: string;
    role: string;
    name?: string;
    email?: string;
    password?: string;
  }) {
    return this.request('/users/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Roles the signed-in staff member may hand out inside their academy. */
  async getAssignableAcademyRoles() {
    const res = await this.request<{
      roles: Array<{ name: string; label: string; hierarchy_level: number }>;
    }>('/users/assignable-roles');
    return res.data;
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getActiveSessions() {
    const res = await this.request<{
      success: boolean;
      sessions: ActiveSession[];
    }>('/auth/sessions');
    return res.data?.sessions ?? [];
  }

  async revokeSession(sessionId: string) {
    return this.request(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  /** Terminates every other device; the current one stays signed in. */
  async logoutOtherDevices() {
    const res = await this.request<{ message: string; revokedCount: number }>('/auth/logout-all', {
      method: 'POST',
      body: JSON.stringify({ keep_current: true }),
    });
    return res.data?.revokedCount ?? 0;
  }

  async loginPhoneByOtp(credentials: { phone_number: string; otp: string; academy_id?: string }) {
    return this.request('/auth/login-by-phone-otp', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async sendAdminLoginOtp(email: string, phone_number: string, captcha_token: string) {
    return this.request('/auth/admin/login-otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, phone_number, captcha_token }),
    });
  }

  async loginEmailByOtp(credentials: { email: string; otp: string; academy_id?: string }) {
    return this.request('/auth/login-by-email-otp', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
}
