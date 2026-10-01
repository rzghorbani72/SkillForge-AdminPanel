import { ApiLayer11 } from './11-profile-password-management';
import type { EnamadState } from '@/types/compliance';
import type { CouponSummary } from '@/lib/coupons';
import { unwrapDataEnvelope } from '../helpers';

export class ApiLayer12 extends ApiLayer11 {
  async reviewAcademyEnamad(academyId: string, body: { approved: boolean; note?: string }) {
    const response = await this.request(`/compliance/review-queue/${academyId}/enamad`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data as EnamadState;
  }

  async createTemplatePreviewToken() {
    const response = await this.request('/ui-template/preview-token', {
      method: 'POST',
    });
    return response.data as {
      token: string;
      expiresIn: string;
      storefrontBaseUrl: string | null;
    };
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

  /** One vote per academy — calling again replaces the previous stars. */
  async rateTemplate(key: string, stars: number) {
    const response = await this.request(`/ui-template/templates/${key}/rating`, {
      method: 'PUT',
      body: JSON.stringify({ stars }),
    });
    return (response.data as any)?.data ?? null;
  }

  async clearTemplateRating(key: string) {
    const response = await this.request(`/ui-template/templates/${key}/rating`, {
      method: 'DELETE',
    });
    return (response.data as any)?.data ?? null;
  }

  async applyTemplatePreset(presetId: string) {
    const response = await this.request(`/ui-template/presets/${presetId}`, {
      method: 'POST',
    });
    return (response.data as any)?.data ?? null;
  }

  async generateTemplate(payload: { field: string; presetId?: string }) {
    const response = await this.request('/ui-template/current/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
    });
    return (response.data as any)?.data ?? null;
  }

  // The platform names the copy server-side, so `name` is only sent when a
  // caller genuinely needs to override it.
  async saveDraftAsTemplate(
    payload: {
      name?: string;
      description?: string;
      preview?: string;
    } = {},
  ) {
    const response = await this.request('/ui-template/current/save-as-template', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (response.data as { data?: unknown })?.data ?? null;
  }

  // Drops this academy's dedicated copy and re-applies the original preset.
  async resetTemplateToOriginal() {
    const response = await this.request('/ui-template/current/copy', {
      method: 'DELETE',
    });
    return (response.data as any)?.data as { presetId: string } | undefined;
  }

  async deleteDedicatedTemplate(key: string) {
    const response = await this.request(`/ui-template/templates/${key}`, {
      method: 'DELETE',
    });
    return (response.data as any) ?? null;
  }

  async getSectionCatalog() {
    const response = await this.request('/ui-template/sections');
    const data = (response.data as { data?: unknown })?.data;
    return Array.isArray(data) ? data : [];
  }

  async overridePublicTemplate(key: string, payload: { blocks: unknown[]; preview?: string }) {
    const response = await this.request(`/ui-template/templates/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return (response.data as any) ?? null;
  }

  async setOwnedTemplateCover(image: string) {
    const response = await this.request('/ui-template/current/dedicated/cover', {
      method: 'PATCH',
      body: JSON.stringify({ image }),
    });
    return (response.data as any) ?? null;
  }

  async setTemplateCover(key: string, image: string) {
    const response = await this.request(`/ui-template/templates/${key}/cover`, {
      method: 'PATCH',
      body: JSON.stringify({ image }),
    });
    return (response.data as any) ?? null;
  }

  async setSectionCover(key: string, blockId: string, image: string) {
    const response = await this.request(`/ui-template/templates/${key}/sections/${blockId}/cover`, {
      method: 'PATCH',
      body: JSON.stringify({ image }),
    });
    return (response.data as any) ?? null;
  }

  async setTemplateVisibility(key: string, visibility: 'PUBLIC' | 'DEDICATED') {
    const response = await this.request(`/ui-template/templates/${key}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    });
    return (response.data as any) ?? null;
  }

  async importSectionToDraft(payload: { presetId: string; blockId: string }) {
    const response = await this.request('/ui-template/current/draft/sections', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (response.data as { data?: unknown })?.data ?? null;
  }

  async swapSectionInDraft(blockId: string, payload: { presetId: string; blockId: string }) {
    const response = await this.request(`/ui-template/current/draft/sections/${blockId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
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
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  // Discounts endpoints
  async getDiscounts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    academy_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (params?.academy_id) queryParams.append('academy_id', params.academy_id.toString());

    const query = queryParams.toString();
    const response = await this.request<any>(`/discounts${query ? `?${query}` : ''}`);

    // Backend returns { message, status, data: { discounts, pagination } };
    // unwrap to the payload so callers read `.discounts` directly.
    return unwrapDataEnvelope<any>(response.data);
  }

  /** Platform plan vouchers the signed-in manager may redeem (read-only). */
  async getRedeemablePlanVouchers(): Promise<{ vouchers: CouponSummary[] }> {
    const response = await this.request<{ vouchers: CouponSummary[] }>('/discounts/plan-vouchers');

    return (
      unwrapDataEnvelope<{ vouchers: CouponSummary[] }>(response.data) ?? {
        vouchers: [],
      }
    );
  }

  async checkDiscountCodeAvailability(params: {
    code: string;
    start_date?: string;
    end_date?: string;
    academy_id?: string;
    exclude_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('code', params.code);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.academy_id) queryParams.append('academy_id', params.academy_id);
    if (params.exclude_id) queryParams.append('exclude_id', params.exclude_id);

    const response = await this.request<{ available: boolean }>(
      `/discounts/check-code?${queryParams.toString()}`,
    );

    return unwrapDataEnvelope<{ available: boolean }>(response.data);
  }

  async getDiscountById(id: string) {
    const response = await this.request<any>(`/discounts/${id}`);

    return unwrapDataEnvelope<any>(response.data);
  }

  async createDiscount(discountData: {
    code: string;
    description?: string;
    discount_type: 'PERCENT' | 'FIXED';
    coupon_type?: 'PERCENT' | 'FIXED' | 'FREE_TRIAL' | 'FULL_DISCOUNT';
    discount_value: number;
    free_trial_days?: number;
    academy_id?: string;
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
      body: JSON.stringify(discountData),
    });

    return unwrapDataEnvelope<any>(response.data);
  }

  async updateDiscount(
    id: string,
    discountData: {
      description?: string;
      discount_type?: 'PERCENT' | 'FIXED';
      coupon_type?: 'PERCENT' | 'FIXED' | 'FREE_TRIAL' | 'FULL_DISCOUNT';
      discount_value?: number;
      free_trial_days?: number;
      usage_limit?: number;
      usage_type?: 'ONE_TIME' | 'LIMITED' | 'UNLIMITED' | 'USER_SPECIFIC';
      start_date?: string;
      end_date?: string;
      is_active?: boolean;
      min_purchase_amount?: number;
      max_discount_amount?: number;
    },
  ) {
    const response = await this.request<any>(`/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(discountData),
    });

    return unwrapDataEnvelope<any>(response.data);
  }

  async deleteDiscount(id: string) {
    const response = await this.request<any>(`/discounts/${id}`, {
      method: 'DELETE',
    });

    // Backend returns { message, status }
    return response.data as any;
  }
}
