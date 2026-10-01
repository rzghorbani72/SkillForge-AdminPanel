import { ApiLayer18 } from './18-set-academy-custom-plan';

export class ApiLayer19 extends ApiLayer18 {
  async processAffiliateWithdrawal(id: number, status: string, notes?: string) {
    const res = await this.request<any>(`/affiliates/withdrawals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async searchAffiliateCandidates(search: string) {
    const res = await this.request<any>(
      `/affiliates/candidates?search=${encodeURIComponent(search)}`,
    );
    return (res.data as any)?.data ?? res.data ?? [];
  }

  async createAffiliate(data: {
    affiliate_name: string;
    affiliate_email?: string;
    affiliate_phone?: string;
    code?: string;
    course_id?: number;
    academy_id: string;
    commission_rate: number;
    profile_id?: number;
  }) {
    const res = await this.request<any>('/affiliates', {
      method: 'POST',
      body: JSON.stringify(data),
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
    }>,
  ) {
    const res = await this.request<any>(`/affiliates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async deleteAffiliate(id: number) {
    const res = await this.request<any>(`/affiliates/${id}`, {
      method: 'DELETE',
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
      body: JSON.stringify(dto),
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
    },
  ) {
    const res = await this.request<any>(`/academy-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async deleteAcademyPlan(id: number) {
    const res = await this.request<any>(`/academy-plans/${id}`, {
      method: 'DELETE',
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
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }
}
