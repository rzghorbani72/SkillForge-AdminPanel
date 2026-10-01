import { ApiLayer10 } from './10-update-custom-domain-setup';
import type {
  AbuseReport,
  ContentKind,
  ContentQueueItem,
  EnamadState,
  ModerationPolicy,
  ModerationPolicyMap,
  ReviewQueueItem,
  ReviewQueueResponse,
} from '@/types/compliance';
import type { SellerIdentity, UpdateSellerIdentityPayload } from '@/types/seller-identity';
import type {
  KycState,
  VerifiedIban,
  VerifyKycIdentityPayload,
  VerifyKycShebaPayload,
} from '@/types/kyc';

export class ApiLayer11 extends ApiLayer10 {
  // Profile password management
  async changeProfilePassword(data: {
    /** Omit to change the signed-in profile's own password. */
    profile_id?: string | number;
    /** Omit to set a new password without re-entering the old one. */
    current_password?: string;
    new_password: string;
    confirm_new_password: string;
  }) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
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
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async publishThemeConfig() {
    const response = await this.request('/theme/current/config/publish', {
      method: 'POST',
    });
    return response.data;
  }

  async getUserProfiles() {
    return this.request('/auth/profiles', {
      method: 'POST',
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
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
    });
    return (response.data as any)?.data ?? null;
  }

  async publishUITemplate() {
    const response = await this.request('/ui-template/current/publish', {
      method: 'POST',
    });
    return (response.data as any)?.data ?? null;
  }

  async publishSite() {
    const response = await this.request('/ui-template/current/publish-site', {
      method: 'POST',
    });
    return response.data;
  }

  async getSellerIdentity() {
    const response = await this.request('/academies/current/seller-identity');
    return response.data as SellerIdentity;
  }

  async updateSellerIdentity(payload: UpdateSellerIdentityPayload) {
    const response = await this.request('/academies/current/seller-identity', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return response.data as SellerIdentity;
  }

  async getKyc() {
    const response = await this.request('/academies/current/kyc');
    return response.data as KycState;
  }

  async verifyKycIdentity(payload: VerifyKycIdentityPayload) {
    const response = await this.request('/academies/current/kyc/verify-identity', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data as KycState;
  }

  async verifyKycSheba(payload: VerifyKycShebaPayload) {
    const response = await this.request('/academies/current/kyc/verify-sheba', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data as KycState;
  }

  async confirmKycIban() {
    const response = await this.request('/academies/current/kyc/confirm-iban', {
      method: 'POST',
    });
    return response.data as KycState;
  }

  async getVerifiedKycIbans() {
    const response = await this.request('/academies/current/kyc/verified-ibans');
    return response.data as VerifiedIban[];
  }

  async selectKycIban(shebaNumber: string) {
    const response = await this.request('/academies/current/kyc/select-iban', {
      method: 'POST',
      body: JSON.stringify({ sheba_number: shebaNumber }),
    });
    return response.data as KycState;
  }

  async getAcademyKyc(academyId: string) {
    const response = await this.request(`/compliance/review-queue/${academyId}/kyc`);
    return response.data as KycState;
  }

  // --- Compliance: eNamad (manager) and content moderation (platform staff) ---

  async getEnamadState() {
    const response = await this.request('/compliance/current/enamad');
    return response.data as EnamadState | null;
  }

  async submitEnamadCode(enamad_code: string, enamad_seal_id?: string) {
    const response = await this.request('/compliance/current/enamad', {
      method: 'POST',
      body: JSON.stringify({
        enamad_code,
        ...(enamad_seal_id ? { enamad_seal_id } : {}),
      }),
    });
    return response.data as EnamadState;
  }

  async updateEnamadHosting(body: { enamad_seal_id?: string; enamad_title_verify?: boolean }) {
    const response = await this.request('/compliance/current/enamad', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data as EnamadState;
  }

  async getReviewQueue(params: { status?: string; public_domain_only?: boolean; page?: number }) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.public_domain_only) query.set('public_domain_only', 'true');
    if (params.page) query.set('page', String(params.page));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await this.request(`/compliance/review-queue${suffix}`);
    return response.data as ReviewQueueResponse;
  }

  async reviewAcademyContent(academyId: string, body: { status: string; note?: string }) {
    const response = await this.request(`/compliance/review-queue/${academyId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data as ReviewQueueItem;
  }

  async getAbuseReports(status?: string) {
    const suffix = status ? `?status=${status}` : '';
    const response = await this.request(`/compliance/abuse-reports${suffix}`);
    return response.data as {
      items: AbuseReport[];
      overdue: number;
    };
  }

  async resolveAbuseReport(id: string, body: { status: string; note?: string }) {
    const response = await this.request(`/compliance/abuse-reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data as AbuseReport;
  }

  async getModerationDefaults() {
    const response = await this.request('/compliance/moderation-defaults');
    return response.data as ModerationPolicyMap;
  }

  async updateModerationDefaults(patch: Partial<ModerationPolicyMap>) {
    const response = await this.request('/compliance/moderation-defaults', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return response.data as ModerationPolicyMap;
  }

  async getAcademyModerationPolicy(academyId: string) {
    const response = await this.request(`/compliance/review-queue/${academyId}/moderation-policy`);
    return response.data as Partial<ModerationPolicyMap>;
  }

  async setAcademyModerationPolicy(
    academyId: string,
    body: { content_kind: ContentKind; policy: ModerationPolicy | null },
  ) {
    const response = await this.request(`/compliance/review-queue/${academyId}/moderation-policy`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data as Partial<ModerationPolicyMap>;
  }

  async getContentQueue(params: { content_kind?: ContentKind; status?: string }) {
    const query = new URLSearchParams();
    if (params.content_kind) query.set('content_kind', params.content_kind);
    if (params.status) query.set('status', params.status);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await this.request(`/compliance/content-queue${suffix}`);
    return response.data as ContentQueueItem[];
  }

  async reviewContentItem(
    id: string,
    body: { content_kind: ContentKind; status: string; note?: string },
  ) {
    const response = await this.request(`/compliance/content-queue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data;
  }
}
