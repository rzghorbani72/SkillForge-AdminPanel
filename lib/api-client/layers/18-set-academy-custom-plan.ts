import { ApiLayer17 } from './17-list-tutoring-sessions';
import type { TeacherBalance, TeacherPayoutRecord } from '@/types/teacher-earnings';
import type { LedgerPaymentsResponse, SettlementDesk } from '@/types/financial';
import { listFrom, unwrapData, unwrapDataEnvelope } from '../helpers';
import type { Affiliate } from '@/components/affiliates/types';
import type { AffiliateLink } from '@/app/(protected)/my-affiliate/_lib/page-helpers';
import type {
  PaymentPlanRow,
  RefundEligibility,
  TeacherPayoutRequestRow,
  WithdrawalRequestRow,
} from '@/types/financial';
import type { StructuredPlanLimits } from '../types-1';

export class ApiLayer18 extends ApiLayer17 {
  async setAcademyCustomPlan(
    id: string,
    dto: {
      name: string;
      limits: StructuredPlanLimits;
      features?: string[];
      price_monthly_toman?: number;
      price_yearly_toman?: number;
      note?: string;
      margin_override?: boolean;
    },
  ) {
    const res = await this.request<unknown>(`/academies/${id}/custom-plan`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return unwrapData<unknown>(res.data);
  }

  async clearAcademyCustomPlan(id: string) {
    const res = await this.request<unknown>(`/academies/${id}/custom-plan`, {
      method: 'DELETE',
    });
    return unwrapData<unknown>(res.data);
  }

  async getAcademyWallet(academyId: string) {
    const res = await this.request<unknown>(`/financial/academies/${academyId}/wallet`);
    return unwrapData<unknown>(res.data);
  }

  // -------------------------------------------------------------------------
  // Store Settings (webhooks)
  // -------------------------------------------------------------------------

  async getStoreSettings(academyId: string) {
    const res = await this.request<unknown>(`/academies/${academyId}/settings`);
    return unwrapData<unknown>(res.data);
  }

  async setStoreSetting(academyId: string, key: string, value: string) {
    const res = await this.request<unknown>(`/academies/${academyId}/settings`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
    return unwrapData<unknown>(res.data);
  }

  // -------------------------------------------------------------------------
  // Payment Plans
  // -------------------------------------------------------------------------

  async getPaymentPlans(courseId: string) {
    const res = await this.request<unknown>(`/payment-plans/courses/${courseId}`);
    return listFrom<PaymentPlanRow>(res.data, 'plans');
  }

  async createPaymentPlan(
    courseId: string,
    data: {
      installment_count: number;
      amount_per_installment: number;
      interval_days: number;
    },
  ) {
    const res = await this.request<unknown>(`/payment-plans/courses/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }

  async updatePaymentPlan(
    id: string,
    data: Partial<{
      is_active: boolean;
      amount_per_installment: number;
      interval_days: number;
    }>,
  ) {
    const res = await this.request<unknown>(`/payment-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }

  // -------------------------------------------------------------------------
  // Bundles
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Refunds
  // -------------------------------------------------------------------------

  async getRefundEligibility(paymentId: string) {
    const res = await this.request<unknown>(`/refunds/payments/${paymentId}`);
    return unwrapData<RefundEligibility>(res.data);
  }

  async issueRefund(
    paymentId: string,
    data: {
      refund_amount?: number;
      reason: string;
      revoke_enrollment?: boolean;
    },
  ) {
    const res = await this.request<unknown>(`/refunds/payments/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }

  // -------------------------------------------------------------------------
  // Withdrawals
  // -------------------------------------------------------------------------

  async getWithdrawals(params?: {
    academy_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const query = qs.toString();
    const res = await this.request<unknown>(`/financial/withdrawals${query ? `?${query}` : ''}`);
    return listFrom<WithdrawalRequestRow>(res.data, 'withdrawals');
  }

  async getSettlementWithdrawals(params?: { academy_id?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const query = qs.toString();
    const res = await this.request<unknown>(
      `/financial/settlement/withdrawals${query ? `?${query}` : ''}`,
    );
    return unwrapData<unknown>(res.data);
  }

  async approveWithdrawal(id: string, data: { bank_transaction_code: string; notes?: string }) {
    const res = await this.request<unknown>(`/financial/settlement/withdrawals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }

  async rejectWithdrawal(id: string, data: { notes?: string }) {
    const res = await this.request<unknown>(`/financial/settlement/withdrawals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }

  async getPendingSettlementCount() {
    const res = await this.request<{ count: number } | { data: { count: number } }>(
      '/financial/settlement/withdrawals/pending-count',
    );
    return unwrapDataEnvelope(res.data).count;
  }

  async getSettlementDesk() {
    const res = await this.request<SettlementDesk | { data: SettlementDesk }>(
      '/financial/settlement/desk',
    );
    return unwrapDataEnvelope(res.data);
  }

  async getSettlementPayments(params?: { page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    const res = await this.request<LedgerPaymentsResponse | { data: LedgerPaymentsResponse }>(
      `/financial/settlement/payments${qs.toString() ? `?${qs}` : ''}`,
    );
    return unwrapDataEnvelope(res.data);
  }

  async notifySettlementManager(id: string) {
    await this.request(`/financial/settlement/withdrawals/${id}/notify`, {
      method: 'POST',
    });
  }

  // -------------------------------------------------------------------------
  // Teacher Payouts
  // -------------------------------------------------------------------------

  async getTeacherBalance() {
    const res = await this.request<TeacherBalance>('/teacher-wallet/balance');
    return res.data;
  }

  async getTeacherPayoutRecords() {
    const res = await this.request<TeacherPayoutRecord[]>('/teacher-wallet/payout-requests');
    return res.data;
  }

  async confirmTeacherPayout(id: string) {
    await this.request(`/teacher-wallet/payouts/${id}/confirm`, {
      method: 'POST',
    });
  }

  async rejectRecordedTeacherPayout(id: string) {
    await this.request(`/teacher-wallet/payouts/${id}/reject`, {
      method: 'POST',
    });
  }

  async getTeacherPayouts(params?: {
    profile_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const res = await this.request<unknown>(
      `/teacher-wallet/payout-requests${qs.toString() ? `?${qs}` : ''}`,
    );
    return listFrom<TeacherPayoutRequestRow>(res.data, 'requests');
  }

  async recordTeacherPayout(body: {
    teacher_profile_id: string;
    amount: number;
    tracking_code: string;
    bank_response?: string;
  }) {
    const res = await this.request<{ id: string }>('/teacher-wallet/payouts', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  }

  async approveTeacherPayout(id: string) {
    const res = await this.request<unknown>(`/teacher-wallet/payout-requests/${id}/approve`, {
      method: 'POST',
    });
    return unwrapData<unknown>(res.data);
  }

  async rejectTeacherPayout(id: string, notes?: string) {
    const res = await this.request<unknown>(`/teacher-wallet/payout-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    return unwrapData<unknown>(res.data);
  }

  // -------------------------------------------------------------------------
  // Affiliates
  // -------------------------------------------------------------------------

  async checkAffiliatePhone(phone: string): Promise<{ exists: boolean; name?: string }> {
    const res = await this.request<unknown>(
      `/affiliates/check-phone?phone=${encodeURIComponent(phone)}`,
    );
    return unwrapData<{ exists: boolean; name?: string }>(res.data);
  }

  async createAffiliateAccount(data: {
    affiliate_name: string;
    phone: string;
    password?: string;
    commission_rate: number;
    send_sms?: boolean;
  }) {
    const res = await this.request<unknown>('/affiliates/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(res.data);
  }

  async confirmPhoneOtp(temp_token: string, otp: string) {
    const res = await this.request<unknown>('/auth/confirm-phone', {
      method: 'POST',
      body: JSON.stringify({ temp_token, otp }),
    });
    return res.data;
  }

  async setNewPassword(temp_token: string, new_password: string) {
    const res = await this.request<unknown>('/auth/set-new-password', {
      method: 'POST',
      body: JSON.stringify({ temp_token, new_password }),
    });
    return res.data;
  }

  async deactivateAffiliate(id: string) {
    const res = await this.request<unknown>(`/affiliates/${id}/deactivate`, {
      method: 'PATCH',
      body: '{}',
    });
    return unwrapData<unknown>(res.data);
  }

  async getAffiliates() {
    const res = await this.request<unknown>('/affiliates');
    return listFrom<Affiliate>(res.data, 'affiliates');
  }

  async getMyAffiliateLinks() {
    const res = await this.request<unknown>('/affiliates/my');
    return listFrom<AffiliateLink>(res.data, 'links');
  }

  async requestAffiliateWithdrawal(linkId: string, amount: number) {
    const res = await this.request<unknown>(`/affiliates/my/${linkId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return unwrapData<unknown>(res.data);
  }

  async getAffiliateWithdrawals(status?: string) {
    const qs = status ? `?status=${status}` : '';
    const res = await this.request<unknown>(`/affiliates/withdrawals${qs}`);
    return unwrapData<unknown[]>(res.data);
  }
}
