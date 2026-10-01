import { ApiLayer18 } from './18-set-academy-custom-plan';
import type { AcademyPlanData } from '@/components/plans/plan-types';
import { unwrapData } from '../helpers';

export class ApiLayer19 extends ApiLayer18 {
  async processAffiliateWithdrawal(id: string, status: string, notes?: string) {
    const res = await this.request<unknown>(`/affiliates/withdrawals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    return unwrapData<unknown>(res.data);
  }

  async searchAffiliateCandidates(search: string) {
    const res = await this.request<unknown>(
      `/affiliates/candidates?search=${encodeURIComponent(search)}`,
    );
    return unwrapData<unknown[]>(res.data);
  }

  async createAffiliate(data: {
    affiliate_name: string;
    affiliate_email?: string;
    affiliate_phone?: string;
    code?: string;
    course_id?: string;
    academy_id: string;
    commission_rate: number;
    profile_id?: string;
  }) {
    const res = await this.request<unknown>('/affiliates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }

  async updateAffiliate(
    id: string,
    data: Partial<{
      affiliate_name: string;
      affiliate_email: string;
      affiliate_phone: string;
      is_active: boolean;
      commission_rate: number;
    }>,
  ) {
    const res = await this.request<unknown>(`/affiliates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }

  async deleteAffiliate(id: string) {
    const res = await this.request<unknown>(`/affiliates/${id}`, {
      method: 'DELETE',
    });
    return unwrapData<unknown>(res.data);
  }

  async getAffiliateStats(code: string) {
    const res = await this.request<unknown>(`/affiliates/${code}/stats`);
    return unwrapData<unknown>(res.data);
  }

  // -------------------------------------------------------------------------
  // Academy Plans & Subscriptions
  // -------------------------------------------------------------------------

  async getAcademyPlans(kind?: string) {
    const qs = kind ? `?kind=${kind}` : '';
    const res = await this.request<unknown>(`/academy-plans${qs}`);
    return unwrapData<AcademyPlanData[]>(res.data);
  }

  async createAcademyPlan(dto: {
    kind: 'SUBSCRIPTION' | 'PACKAGE';
    name: string;
    description?: string;
    price: number;
    duration_days?: number;
  }) {
    const res = await this.request<unknown>('/academy-plans', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return unwrapData<unknown>(res.data);
  }

  async updateAcademyPlan(
    id: string,
    dto: {
      name?: string;
      description?: string;
      price?: number;
      duration_days?: number;
      is_active?: boolean;
    },
  ) {
    const res = await this.request<unknown>(`/academy-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return unwrapData<unknown>(res.data);
  }

  async deleteAcademyPlan(id: string) {
    const res = await this.request<unknown>(`/academy-plans/${id}`, {
      method: 'DELETE',
    });
    return unwrapData<unknown>(res.data);
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
    const res = await this.request<unknown>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }
}
