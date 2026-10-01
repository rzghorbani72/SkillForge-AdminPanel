import { ApiLayer01 } from './01-auth-endpoints';
import { OtpType } from '@/constants/data';
import type {
  ContactMessageItem,
  Responsible,
  StaffTicketDetail,
} from '@/components/support/staff-support-types';
import { Offer, OfferInput } from '@/types/api';
import { unwrapEnvelope, unwrapSupportInbox } from '../helpers';
import type { ReadOptions, SupportInboxQuery, SupportInboxSummary } from '../types-1';

export class ApiLayer02 extends ApiLayer01 {
  async selectAcademy(data: { temp_token: string; academy_id: string }) {
    return this.request('/auth/select-academy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async switchAcademy(academy_id: string) {
    return this.request('/auth/switch-academy', {
      method: 'POST',
      body: JSON.stringify({ academy_id }),
    });
  }

  async markOnboardingSeen() {
    return this.request('/auth/me/onboarding-seen', { method: 'PATCH' });
  }

  async consumePanelHandoff(code: string) {
    return this.request('/auth/panel-handoff/consume', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Note: These enhanced auth endpoints have been removed
  // Use the standard auth endpoints instead
  async switchProfile() {
    throw new Error('switchProfile endpoint not available - use standard auth flow');
  }

  async getUserAcademies() {
    const response = await this.request('/academies');
    return response.data;
  }

  async createProfile(profileData: {
    academy_id: string;
    role: string;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
  }) {
    return this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // OTP endpoints - Updated to use new OTP controller
  async sendPhoneOtp(phone_number: string, type: OtpType, captcha_token: string) {
    return this.request('/auth/otp/send-phone', {
      method: 'POST',
      body: JSON.stringify({ phone_number, type, captcha_token }),
    }) as any;
  }

  async sendEmailOtp(email: string, type: OtpType, captcha_token: string) {
    return this.request('/auth/otp/send-email', {
      method: 'POST',
      body: JSON.stringify({ email, type, captcha_token }),
    }) as any;
  }

  async verifyPhoneOtp(phone_number: string, otp: string, type: OtpType) {
    return this.request('/auth/otp/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ phone_number, otp, type }),
    }) as any;
  }

  async verifyEmailOtp(email: string, otp: string, type: OtpType) {
    return this.request('/auth/otp/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp, type }),
    }) as any;
  }

  // Forget password endpoints
  async forgetPassword(data: {
    identifier: string;
    password: string;
    confirmed_password: string;
    otp: string;
    role?: string;
    academy_id?: string;
  }) {
    return this.request('/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
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

  // ── Offers (one purchasable option over one or more courses) ───────────────
  async getCourseOffers(courseId: string, opts?: ReadOptions) {
    const response = await this.request(`/offers/manage/course/${courseId}`, opts);
    return (response.data as Offer[]) ?? [];
  }

  async getAcademyOffers(opts?: ReadOptions) {
    const response = await this.request('/offers/manage', opts);
    return (response.data as Offer[]) ?? [];
  }

  async createOffer(body: OfferInput) {
    const response = await this.request('/offers', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.data as Offer;
  }

  async updateOffer(id: string, body: Partial<OfferInput>) {
    const response = await this.request(`/offers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data as Offer;
  }

  async deleteOffer(id: string) {
    await this.request(`/offers/${id}`, { method: 'DELETE' });
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
    const response = await this.request(`/support-access-logs${query ? `?${query}` : ''}`);
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
  protected supportQuery(params?: Record<string, string | undefined>) {
    const qs = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (v) qs.append(k, v);
    const s = qs.toString();
    return s ? `?${s}` : '';
  }

  async getSupportInbox(params?: SupportInboxQuery) {
    const res = await this.request(
      `/support/inbox${this.supportQuery(this.supportInboxQueryParams(params))}`,
    );
    return unwrapSupportInbox(res);
  }

  async getSupportPlatformInbox(params?: SupportInboxQuery) {
    const res = await this.request(
      `/support/platform/inbox${this.supportQuery(this.supportInboxQueryParams(params))}`,
    );
    return unwrapSupportInbox(res);
  }

  async getSupportInboxSummary(
    scope: 'academy' | 'platform',
    params?: SupportInboxQuery,
  ): Promise<SupportInboxSummary> {
    const path = scope === 'academy' ? '/support/inbox/summary' : '/support/platform/inbox/summary';
    const res = await this.request(
      `${path}${this.supportQuery(this.supportInboxQueryParams(params))}`,
    );
    return unwrapEnvelope<SupportInboxSummary>(res);
  }

  async claimSupportTicket(id: string) {
    const res = await this.request(`/support/tickets/${id}/claim`, {
      method: 'POST',
    });
    return unwrapEnvelope<unknown>(res);
  }

  protected supportInboxQueryParams(
    params?: SupportInboxQuery,
  ): Record<string, string | undefined> {
    if (!params) return {};
    return {
      status: params.status,
      priority: params.priority,
      academy_id: params.academy_id,
      category: params.category,
      team: params.team,
      assigned_to: params.assigned_to,
      unassigned: params.unassigned ? 'true' : undefined,
      mine: params.mine ? 'true' : undefined,
      search: params.search,
      page: params.page != null ? String(params.page) : undefined,
      limit: params.limit != null ? String(params.limit) : undefined,
    };
  }

  // ----- Public contact-page messages (platform staff) -----
  async getContactMessages(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await this.request(
      `/support/contact-messages${this.supportQuery({
        status: params?.status,
        search: params?.search,
        page: params?.page != null ? String(params.page) : undefined,
        limit: params?.limit != null ? String(params.limit) : undefined,
      })}`,
    );
    return (res as any).data as {
      items: ContactMessageItem[];
      total: number;
      page: number;
      limit: number;
    };
  }

  async updateContactMessage(id: string, body: { status?: string; staff_note?: string }) {
    const res = await this.request(`/support/contact-messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return (res as any).data as ContactMessageItem;
  }

  async getSupportTicket(id: string): Promise<StaffTicketDetail> {
    const res = await this.request(`/support/tickets/${id}`);
    return unwrapEnvelope<StaffTicketDetail>(res);
  }

  async listSupportResponsibles(): Promise<Responsible[]> {
    const res = await this.request(`/support/responsibles`);
    return unwrapEnvelope<Responsible[]>(res) ?? [];
  }

  async getPlatformResponsibles(): Promise<Responsible[]> {
    const res = await this.request(`/support/platform/responsibles`);
    return unwrapEnvelope<Responsible[]>(res) ?? [];
  }

  async createPlatformTicket(body: {
    subject: string;
    body: string;
    category: string;
    priority?: string;
  }) {
    const res = await this.request(`/support/platform/tickets`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return unwrapEnvelope<unknown>(res);
  }

  async replySupportTicket(
    id: string,
    body: { body: string; image_ids?: string[]; internal_note?: boolean },
  ) {
    const res = await this.request(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return unwrapEnvelope<unknown>(res);
  }

  async reassignSupportTicket(id: string, responsible_id: string) {
    const res = await this.request(`/support/tickets/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ responsible_id }),
    });
    return unwrapEnvelope<unknown>(res);
  }

  async changeSupportStatus(id: string, status: string, resolution_summary?: string) {
    const res = await this.request(`/support/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution_summary }),
    });
    return unwrapEnvelope<unknown>(res);
  }
}
