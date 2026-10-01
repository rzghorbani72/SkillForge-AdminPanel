import { ApiLayer02 } from './02-select-academy';
import { Academy } from '@/types/api';
import type {
  AcademyPage,
  AcademyPagePayload,
  AcademyPageSlug,
  ContactLink,
} from '@/types/academy-site';
import { unwrapDataEnvelope, unwrapEnvelope } from '../helpers';
import type {
  AcademyFeatureFlags,
  AcademySiteStatusData,
  DisableAcademySitePayload,
  LearningNavCapabilities,
  ReadOptions,
} from '../types-1';
import type {
  AcademyDashboardBanners,
  AcademyHealthView,
  CreateDashboardBannerPayload,
  CreatePlatformBroadcastPayload,
  DashboardBanner,
  DeleteStorageObjectsResult,
  NotificationListResponse,
  PlatformBroadcast,
  StorageInventory,
  UpdateDashboardBannerPayload,
} from '../types-2';

export class ApiLayer03 extends ApiLayer02 {
  async changeSupportPriority(id: string, priority: string) {
    const res = await this.request(`/support/tickets/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
    return unwrapEnvelope<unknown>(res);
  }

  async logSupportCall(
    id: string,
    body: { status: string; outcome_note?: string; called_at?: string },
  ) {
    const res = await this.request(`/support/tickets/${id}/log-call`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return unwrapEnvelope<unknown>(res);
  }

  async logSupportEmail(id: string, body: { outcome_note?: string }) {
    const res = await this.request(`/support/tickets/${id}/log-email`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return unwrapEnvelope<unknown>(res);
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
    const data = unwrapEnvelope<{ count?: number }>(
      await this.request('/notifications/unread-count'),
    );
    return typeof data?.count === 'number' ? data.count : 0;
  }

  async markNotificationRead(id: string) {
    const res = await this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return (res as { data?: unknown }).data;
  }

  async markAllNotificationsRead() {
    const res = await this.request('/notifications/read-all', {
      method: 'POST',
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
      body: JSON.stringify(body),
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
      method: 'POST',
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

  async listDashboardBanners() {
    const data = unwrapEnvelope<{ banners?: DashboardBanner[] }>(
      await this.request('/platform/dashboard-banners'),
    );
    return data?.banners ?? [];
  }

  async createDashboardBanner(body: CreateDashboardBannerPayload) {
    const data = unwrapEnvelope<{ banner?: DashboardBanner }>(
      await this.request('/platform/dashboard-banners', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
    return data?.banner;
  }

  async updateDashboardBanner(id: string, body: UpdateDashboardBannerPayload) {
    const data = unwrapEnvelope<{ banner?: DashboardBanner }>(
      await this.request(`/platform/dashboard-banners/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    );
    return data?.banner;
  }

  async deleteDashboardBanner(id: string) {
    await this.request(`/platform/dashboard-banners/${id}`, {
      method: 'DELETE',
    });
  }

  async listStorageObjects() {
    return unwrapEnvelope<StorageInventory>(await this.request('/platform/storage/objects'));
  }

  async deleteStorageObjects(keys: string[]) {
    return unwrapEnvelope<DeleteStorageObjectsResult>(
      await this.request('/platform/storage/objects', {
        method: 'DELETE',
        body: JSON.stringify({ keys }),
      }),
    );
  }

  async deleteAllUnusedStorageObjects() {
    return unwrapEnvelope<DeleteStorageObjectsResult>(
      await this.request('/platform/storage/objects/unused', {
        method: 'DELETE',
      }),
    );
  }

  async getAcademyDashboardBanners() {
    return (
      unwrapEnvelope<AcademyDashboardBanners>(await this.request('/dashboard/banners')) ?? {
        state: 'INCOMPLETE',
        has_template: false,
        has_course: false,
        banners: [],
      }
    );
  }

  async getCurrentAcademy() {
    const response = await this.request('/academies/current');
    return response;
  }

  /** The current academy already unwrapped, for forms that hydrate from it. */
  async getCurrentAcademyDetail(): Promise<Academy> {
    const response = await this.request<Academy | { data: Academy }>('/academies/current');
    const payload = response.data as Academy | { data: Academy };
    return ((payload as { data?: Academy })?.data ?? payload) as Academy;
  }

  async checkSlugAvailability(slug: string, opts?: ReadOptions): Promise<{ available: boolean }> {
    const res = await this.request<{ available: boolean }>(
      `/academies/slug-available?slug=${encodeURIComponent(slug)}`,
      opts,
    );
    return (res as any)?.data ?? res;
  }

  async getAcademySiteStatus(): Promise<AcademySiteStatusData> {
    const response = await this.request('/academies/current/site-status');
    const payload = response.data as any;
    return (payload?.data ?? payload) as AcademySiteStatusData;
  }

  async disableAcademySite(payload: DisableAcademySitePayload) {
    return this.request('/academies/current/site/disable', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async enableAcademySite() {
    return this.request('/academies/current/site/enable', { method: 'POST' });
  }

  async createAcademy(storeData: {
    name: string;
    private_domain: string;
    description?: string;
    logo_id?: string;
    favicon_id?: string;
  }) {
    return this.request('/academies', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async updateAcademy(storeData: {
    name?: string;
    private_domain?: string;
    public_address?: string | null;
    description?: string;
    logo_id?: string;
    favicon_id?: string;
    meta_title?: string | null;
    meta_description?: string | null;
    og_image_id?: string | null;
    showcase_desktop_id?: string | null;
    showcase_mobile_id?: string | null;
    teacher_share_rate?: number;
  }) {
    return this.request('/academies/current', {
      method: 'PATCH',
      body: JSON.stringify(storeData),
    });
  }

  async getCurrentAcademyFeatures(): Promise<AcademyFeatureFlags> {
    const res = await this.request<AcademyFeatureFlags | { data: AcademyFeatureFlags }>(
      '/academies/current/features',
    );
    return unwrapDataEnvelope(res.data);
  }

  async updateCurrentAcademyFeatures(
    data: Partial<AcademyFeatureFlags>,
  ): Promise<AcademyFeatureFlags> {
    const res = await this.request<AcademyFeatureFlags | { data: AcademyFeatureFlags }>(
      '/academies/current/features',
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
    return unwrapDataEnvelope(res.data);
  }

  async getAcademyPages(): Promise<AcademyPage[]> {
    const res = await this.request<AcademyPage[] | { data: AcademyPage[] }>('/academy-site/pages');
    return unwrapDataEnvelope(res.data);
  }

  async updateAcademyPage(slug: AcademyPageSlug, data: AcademyPagePayload): Promise<AcademyPage> {
    const res = await this.request<AcademyPage | { data: AcademyPage }>(
      `/academy-site/pages/${slug}`,
      { method: 'PUT', body: JSON.stringify(data) },
    );
    return unwrapDataEnvelope(res.data);
  }

  async getAcademyContactLinks(): Promise<ContactLink[]> {
    const res = await this.request<ContactLink[] | { data: ContactLink[] }>(
      '/academy-site/contact-links',
    );
    return unwrapDataEnvelope(res.data);
  }

  async updateAcademyContactLinks(links: ContactLink[]): Promise<ContactLink[]> {
    const res = await this.request<ContactLink[] | { data: ContactLink[] }>(
      '/academy-site/contact-links',
      { method: 'PUT', body: JSON.stringify({ links }) },
    );
    return unwrapDataEnvelope(res.data);
  }

  async getLearningNavCapabilities(opts?: ReadOptions): Promise<LearningNavCapabilities> {
    const res = await this.request<LearningNavCapabilities | { data: LearningNavCapabilities }>(
      '/staff/me/learning-capabilities',
      opts,
    );
    return unwrapDataEnvelope(res.data);
  }

  async updateAcademyById(
    _id: string,
    data: {
      name?: string;
      private_domain?: string;
      public_address?: string | null;
      description?: string;
      logo_id?: string;
      favicon_id?: string;
    },
  ) {
    return this.updateAcademy(data);
  }

  async setAcademyPublicListing(id: string, listed_publicly: boolean) {
    return this.request(`/academies/${id}/public-listing`, {
      method: 'PATCH',
      body: JSON.stringify({ listed_publicly }),
    });
  }
}
