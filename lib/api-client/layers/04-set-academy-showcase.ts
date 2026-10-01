import { ApiLayer03 } from './03-change-support-priority';
import type { CourseType } from '@/components/course/course-drafts';
import { PaymentGatewayProvider } from '@/types/api';
import type {
  AcademyStorageUsage,
  AcademySubscriptionOverviewRow,
  AcademyUpgradeQuote,
  ReadOptions,
  StorageFilesPage,
  StorageMediaType,
  TrialClaimResult,
} from '../types-1';

export class ApiLayer04 extends ApiLayer03 {
  async setAcademyShowcase(
    id: string,
    data: {
      showcase_desktop_id?: string | null;
      showcase_mobile_id?: string | null;
    },
  ) {
    return this.request(`/academies/${id}/showcase`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async removeAcademyById(id: string) {
    return this.request(`/academies/${id}`, { method: 'DELETE' });
  }

  async getCurrentAcademySubscription(opts?: ReadOptions) {
    const response = await this.request('/academies/current/subscription', opts);
    const payload = response.data as any;
    return payload?.data ?? payload;
  }

  /** What each media kind takes of this academy's storage quota. */
  async getCurrentAcademyStorageUsage(opts?: ReadOptions): Promise<AcademyStorageUsage> {
    const response = await this.request('/academies/current/storage-usage', opts);
    const payload = response.data as { data?: AcademyStorageUsage };
    if (!payload?.data) throw new Error('Unexpected storage usage response');
    return payload.data;
  }

  /** Files filling the quota, biggest first. */
  async getStorageFiles(
    params: { kind?: StorageMediaType; page?: number; limit?: number } = {},
    opts?: ReadOptions,
  ): Promise<StorageFilesPage> {
    const query = new URLSearchParams();
    if (params.kind) query.set('kind', params.kind);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));

    const response = await this.request(`/storage/files?${query}`, opts);
    const payload = response.data as { data?: StorageFilesPage };
    if (!payload?.data) throw new Error('Unexpected storage files response');
    return payload.data;
  }

  /** Only an unused upload; the backend 409s anything still in use. */
  async deleteStorageFile(kind: StorageMediaType, id: string) {
    return this.request(`/storage/files/${kind}/${id}`, { method: 'DELETE' });
  }

  async deleteAllUnusedStorageFiles(): Promise<{
    deleted: number;
    freed_bytes: number;
  }> {
    const response = await this.request('/storage/unused', {
      method: 'DELETE',
    });
    const payload = response.data as {
      data?: { deleted: number; freed_bytes: number };
    };
    return payload?.data ?? { deleted: 0, freed_bytes: 0 };
  }

  /** Every academy the signed-in owner pays for, each with its own plan. */
  async getSubscriptionsOverview(): Promise<AcademySubscriptionOverviewRow[]> {
    const response = await this.request('/academies/subscriptions/overview');
    const payload = response.data as {
      data?: AcademySubscriptionOverviewRow[];
    };
    return payload?.data ?? [];
  }

  /** Claim the owner's one free trial for this academy, or move it here. */
  async claimAcademyTrial(academyId: string): Promise<TrialClaimResult> {
    const response = await this.request(`/academies/${academyId}/trial`, {
      method: 'POST',
    });
    const payload = response.data as { data?: TrialClaimResult };
    if (!payload?.data) throw new Error('Unexpected trial response');
    return payload.data;
  }

  async renewCurrentAcademySubscription(data: {
    plan_name: string;
    months: number;
    amount: number;
    storage_addon?: number;
    note?: string;
    callback_url?: string;
    provider?: PaymentGatewayProvider;
    coupon_code?: string;
  }): Promise<{
    academy?: unknown;
    payment_id?: string;
    redirect_url?: string;
    amount?: number;
    provider?: string;
    needs_gateway_selection?: boolean;
    available_gateways?: Array<{
      provider: string;
      display_name: string;
    }>;
    billing?: {
      base_plan_amount_irr: number;
      upload_overage_fee_irr: number;
      storage_addon_fee_irr?: number;
      total_amount_irr: number;
      storage_usage_gb: number;
      discount_amount_irr?: number;
    };
    [key: string]: unknown;
  }> {
    const response = await this.request('/academies/current/subscription/renew', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const payload = response.data as {
      data?: Record<string, unknown>;
      [key: string]: unknown;
    };
    return (payload?.data ?? payload) as {
      academy?: unknown;
      payment_id?: string;
      redirect_url?: string;
      amount?: number;
      provider?: string;
      needs_gateway_selection?: boolean;
      available_gateways?: Array<{
        provider: string;
        display_name: string;
      }>;
      billing?: {
        base_plan_amount_irr: number;
        upload_overage_fee_irr: number;
        storage_addon_fee_irr?: number;
        total_amount_irr: number;
        storage_usage_gb: number;
      };
      [key: string]: unknown;
    };
  }

  async purchaseStorageAddon(data: {
    callback_url?: string;
    provider?: PaymentGatewayProvider;
  }): Promise<{
    payment_id?: string;
    redirect_url?: string;
    needs_gateway_selection?: boolean;
    available_gateways?: Array<{ provider: string; display_name: string }>;
    [key: string]: unknown;
  }> {
    const response = await this.request('/academies/current/subscription/storage-addon', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const payload = response.data as {
      data?: Record<string, unknown>;
      [key: string]: unknown;
    };
    return (payload?.data ?? payload) as {
      payment_id?: string;
      redirect_url?: string;
      needs_gateway_selection?: boolean;
      available_gateways?: Array<{ provider: string; display_name: string }>;
      [key: string]: unknown;
    };
  }

  /**
   * What switching to a higher plan costs right now: the prorated diff over the
   * days still owned, plus the storage-quota credit. No commitment — this is a
   * read-only quote the confirm dialog shows before the manager upgrades.
   */
  async getAcademyUpgradeQuote(planSlug: string): Promise<AcademyUpgradeQuote> {
    const response = await this.request(
      `/academies/current/subscription/upgrade-quote?plan=${encodeURIComponent(planSlug)}`,
    );
    const payload = response.data as { data?: AcademyUpgradeQuote };
    return (payload?.data ?? payload) as AcademyUpgradeQuote;
  }

  /**
   * Applies the plan switch priced by {@link getAcademyUpgradeQuote}. When
   * the prorated diff is greater than zero, this INITIATES gateway checkout
   * (mirrors renew) and the plan does not change until that payment verifies
   * — it never applies on initiate, so a manager can't end up on a higher
   * plan without ever paying for it.
   */
  async upgradeCurrentAcademyPlan(
    planSlug: string,
    options?: {
      callback_url?: string;
      provider?: PaymentGatewayProvider;
      coupon_code?: string;
    },
  ): Promise<{
    academy?: unknown;
    payment_id?: string;
    redirect_url?: string;
    amount?: number;
    provider?: string;
    needs_gateway_selection?: boolean;
    available_gateways?: Array<{
      provider: string;
      display_name: string;
    }>;
    [key: string]: unknown;
  }> {
    const response = await this.request('/academies/current/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan_slug: planSlug, ...options }),
    });
    const payload = response.data as { data?: Record<string, unknown> };
    return (payload?.data ?? payload) as {
      academy?: unknown;
      payment_id?: string;
      redirect_url?: string;
      amount?: number;
      provider?: string;
      needs_gateway_selection?: boolean;
      available_gateways?: Array<{
        provider: string;
        display_name: string;
      }>;
      [key: string]: unknown;
    };
  }

  /** Auth is cookie-based, so this URL can be opened directly (e.g. `window.open`). */
  getCurrentAcademySubscriptionInvoicePdfUrl(invoiceId: string | number): string {
    return `${this.baseURL}/academies/current/subscription/invoices/${invoiceId}/pdf`;
  }

  // Courses endpoints
  async getCourses(
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      category_id?: number;
      academy_id?: string;
    },
    opts?: ReadOptions,
  ) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          return;
        }
        queryParams.append(key, value.toString());
      });
    }

    const response = (await this.request(`/courses?${queryParams.toString()}`, opts)) as any;
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
    learning_outcomes?: string;
    requirements?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    is_certificate?: boolean;
    course_type?: CourseType;
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
        cover_id?: string | null;
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
      cover_id?: string | null;
    }>;
  }) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }
}
