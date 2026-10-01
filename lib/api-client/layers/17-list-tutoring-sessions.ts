import { ApiLayer16 } from './16-reschedule-class-session';

import type {
  LessonDownloadPolicy,
  RescheduleTutoringSessionPayload,
  ScheduleTutoringSessionPayload,
  TutoringAttendanceStatus,
  TutoringSession,
  TutoringSessionListItem,
  UpdateLessonDownloadPolicyPayload,
} from '@/types/learning-operations';
import { mapPublicPlanToSubscriptionPlan, unwrapDataEnvelope } from '../helpers';
import type {
  PlanEconomicsPreview,
  PlatformSettingsData,
  PublicSubscriptionPlanData,
  StructuredPlanLimits,
  SubscriptionPlanData,
} from '../types-1';
import type { GatewayConfigData, GatewayRegistryStatus } from '../types-2';

export class ApiLayer17 extends ApiLayer16 {
  async listTutoringSessions(params?: {
    search?: string;
    engagement_id?: string;
    limit?: number;
  }): Promise<TutoringSessionListItem[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.append('search', params.search);
    if (params?.engagement_id) qs.append('engagement_id', params.engagement_id);
    if (params?.limit) qs.append('limit', String(params.limit));
    const url = qs.toString() ? `/tutoring/sessions?${qs}` : '/tutoring/sessions';
    const res = await this.request<TutoringSessionListItem[] | { data: TutoringSessionListItem[] }>(
      url,
    );
    const payload = unwrapDataEnvelope(res.data);
    return Array.isArray(payload) ? payload : [];
  }

  async updateLessonDownloadPolicy(
    lessonId: string,
    data: UpdateLessonDownloadPolicyPayload,
  ): Promise<LessonDownloadPolicy> {
    const res = await this.request<LessonDownloadPolicy | { data: LessonDownloadPolicy }>(
      `/lessons/${lessonId}/download-policy`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
    return unwrapDataEnvelope(res.data);
  }

  async scheduleTutoringSession(data: ScheduleTutoringSessionPayload): Promise<TutoringSession> {
    const res = await this.request<TutoringSession | { data: TutoringSession }>(
      '/tutoring/sessions',
      { method: 'POST', body: JSON.stringify(data) },
    );
    return unwrapDataEnvelope(res.data);
  }

  async rescheduleTutoringSession(
    sessionId: string,
    data: RescheduleTutoringSessionPayload,
  ): Promise<TutoringSession> {
    const res = await this.request<TutoringSession | { data: TutoringSession }>(
      `/tutoring/sessions/${sessionId}/reschedule`,
      { method: 'PATCH', body: JSON.stringify(data) },
    );
    return unwrapDataEnvelope(res.data);
  }

  async cancelTutoringSession(
    sessionId: string,
    data?: { reason?: string },
  ): Promise<TutoringSession> {
    const res = await this.request<TutoringSession | { data: TutoringSession }>(
      `/tutoring/sessions/${sessionId}/cancel`,
      { method: 'PATCH', body: JSON.stringify(data ?? {}) },
    );
    return unwrapDataEnvelope(res.data);
  }

  async markTutoringAttendance(
    sessionId: string,
    data: { profile_id: string; status?: TutoringAttendanceStatus },
  ): Promise<unknown> {
    const res = await this.request(`/tutoring/sessions/${sessionId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
      body: JSON.stringify(data),
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
    const url = qs.toString() ? `/student-lesson-access?${qs}` : '/student-lesson-access';
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
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async deleteStudentLessonAccess(id: number) {
    const res = await this.request(`/student-lesson-access/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  // -------------------------------------------------------------------------
  // Platform Settings
  // -------------------------------------------------------------------------

  async getPlatformSettings() {
    const res = await this.request<PlatformSettingsData & { data?: PlatformSettingsData }>(
      '/platform-settings',
    );
    const body = res.data;
    const settings = body?.data ?? body;
    if (!settings || typeof settings !== 'object' || !('vat_rate' in settings)) {
      throw new Error('Invalid platform settings response');
    }
    return settings as PlatformSettingsData;
  }

  async updatePlatformSettings(data: Partial<PlatformSettingsData>) {
    const res = await this.request<PlatformSettingsData>('/platform-settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getSubscriptionPlans() {
    const res = await this.request<SubscriptionPlanData[] | { data?: SubscriptionPlanData[] }>(
      '/platform-settings/plans',
    );
    const body = res.data;
    if (Array.isArray(body)) return body;
    if (body && typeof body === 'object' && Array.isArray(body.data)) {
      return body.data;
    }
    return [];
  }

  // No auth guard — safe for MANAGER / TEACHER. Backend returns the public
  // pricing-page shape (no id, Toman-suffixed fields), so normalize it into
  // SubscriptionPlanData here — the single place callers need to know about
  // that difference.
  async getActivePlans(): Promise<SubscriptionPlanData[]> {
    const res = await this.request<
      PublicSubscriptionPlanData[] | { data?: PublicSubscriptionPlanData[] }
    >('/platform-settings/plans/active');
    const body = res.data;
    const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
    return list.map(mapPublicPlanToSubscriptionPlan);
  }

  async createSubscriptionPlan(
    data: Omit<SubscriptionPlanData, 'id' | 'created_at' | 'updated_at'>,
  ) {
    const res = await this.request<SubscriptionPlanData>('/platform-settings/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updateSubscriptionPlan(id: string, data: Partial<SubscriptionPlanData>) {
    const res = await this.request<SubscriptionPlanData>(`/platform-settings/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async previewPlanEconomics(payload: {
    revenue_toman: number;
    limits: StructuredPlanLimits;
  }): Promise<PlanEconomicsPreview> {
    const res = await this.request<{
      data?: PlanEconomicsPreview;
    }>('/platform-settings/plans/economics-preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const body = res.data;
    return (body as { data?: PlanEconomicsPreview })?.data ?? (body as PlanEconomicsPreview);
  }

  async deleteSubscriptionPlan(id: string) {
    const res = await this.request(`/platform-settings/plans/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  // -------------------------------------------------------------------------
  // Payment Gateway Config (Admin)
  // -------------------------------------------------------------------------

  async listGatewayConfigs(): Promise<{
    gateways: GatewayConfigData[];
    adapter_availability: GatewayRegistryStatus[];
  }> {
    const res = await this.request<{
      status?: string;
      data?: {
        gateways?: GatewayConfigData[];
        adapter_availability?: GatewayRegistryStatus[];
        registry?: GatewayRegistryStatus[];
      };
      gateways?: GatewayConfigData[];
      adapter_availability?: GatewayRegistryStatus[];
      registry?: GatewayRegistryStatus[];
    }>('/payments/gateways/configs');
    const payload = res.data;
    const body = payload?.data ?? payload;
    const gateways = Array.isArray(body?.gateways) ? body.gateways : [];
    const adapter_availability = Array.isArray(body?.adapter_availability)
      ? body.adapter_availability
      : Array.isArray(body?.registry)
        ? body.registry
        : [];
    return { gateways, adapter_availability };
  }

  async updateGatewayConfig(
    id: string,
    data: {
      token?: string;
      is_active?: boolean;
      is_sandbox?: boolean;
      extra?: Record<string, unknown>;
    },
  ) {
    const res = await this.request(`/payments/gateways/${id}/config`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return (res.data as { data?: unknown })?.data ?? res.data;
  }

  async ensurePayPingGateway() {
    const res = await this.request('/payments/gateways/payping/ensure', {
      method: 'POST',
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
    const res = await this.request<any>(`/stores${qs.toString() ? `?${qs}` : ''}`);
    return (res.data as any)?.data ?? res.data;
  }

  async getStore(id: string) {
    const res = await this.request<any>(`/academies/${id}`);
    return (res.data as any)?.data ?? res.data;
  }

  async createStore(data: { name: string; slug: string; country?: string; is_active?: boolean }) {
    const res = await this.request<any>('/academies', {
      method: 'POST',
      body: JSON.stringify(data),
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
    }>,
  ) {
    const res = await this.request<any>(`/academies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updateAcademyCommissionRate(id: number, commission_rate: number) {
    const res = await this.request<any>(`/financial/academies/${id}/commission-rate`, {
      method: 'PATCH',
      body: JSON.stringify({ commission_rate }),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getAcademyCustomPlan(id: string) {
    const res = await this.request<any>(`/academies/${id}/custom-plan`);
    return (res.data as any)?.data ?? res.data;
  }
}
