import { ApiLayer17 } from './17-list-tutoring-sessions';
import type { TeacherBalance, TeacherPayoutRecord } from '@/types/teacher-earnings';
import type { LedgerPaymentsResponse, SettlementDesk } from '@/types/financial';
import { unwrapDataEnvelope } from '../helpers';
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
    const res = await this.request<any>(`/academies/${id}/custom-plan`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async clearAcademyCustomPlan(id: string) {
    const res = await this.request<any>(`/academies/${id}/custom-plan`, {
      method: 'DELETE',
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getAcademyWallet(academyId: string) {
    const res = await this.request<any>(`/financial/academies/${academyId}/wallet`);
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Store Settings (webhooks)
  // -------------------------------------------------------------------------

  async getStoreSettings(academyId: string) {
    const res = await this.request<any>(`/academies/${academyId}/settings`);
    return (res.data as any)?.data ?? res.data;
  }

  async setStoreSetting(academyId: string, key: string, value: string) {
    const res = await this.request<any>(`/academies/${academyId}/settings`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Payment Plans
  // -------------------------------------------------------------------------

  async getPaymentPlans(courseId: string) {
    const res = await this.request<any>(`/payment-plans/courses/${courseId}`);
    return (res.data as any)?.data ?? res.data;
  }

  async createPaymentPlan(
    courseId: string,
    data: {
      installment_count: number;
      amount_per_installment: number;
      interval_days: number;
    },
  ) {
    const res = await this.request<any>(`/payment-plans/courses/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async updatePaymentPlan(
    id: string,
    data: Partial<{
      is_active: boolean;
      amount_per_installment: number;
      interval_days: number;
    }>,
  ) {
    const res = await this.request<any>(`/payment-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Bundles
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Refunds
  // -------------------------------------------------------------------------

  async getRefundEligibility(paymentId: number) {
    const res = await this.request<any>(`/refunds/payments/${paymentId}`);
    return (res.data as any)?.data ?? res.data;
  }

  async issueRefund(
    paymentId: number,
    data: {
      refund_amount?: number;
      reason: string;
      revoke_enrollment?: boolean;
    },
  ) {
    const res = await this.request<any>(`/refunds/payments/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
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
    const res = await this.request<any>(`/financial/withdrawals${query ? `?${query}` : ''}`);
    return (res.data as any)?.data ?? res.data;
  }

  async getSettlementWithdrawals(params?: { academy_id?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const query = qs.toString();
    const res = await this.request<any>(
      `/financial/settlement/withdrawals${query ? `?${query}` : ''}`,
    );
    return (res.data as any)?.data ?? res.data;
  }

  async approveWithdrawal(id: string, data: { bank_transaction_code: string; notes?: string }) {
    const res = await this.request<any>(`/financial/settlement/withdrawals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async rejectWithdrawal(id: string, data: { notes?: string }) {
    const res = await this.request<any>(`/financial/settlement/withdrawals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
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
    profile_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const res = await this.request<any>(
      `/teacher-wallet/payout-requests${qs.toString() ? `?${qs}` : ''}`,
    );
    return (res.data as any)?.data ?? res.data;
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

  async approveTeacherPayout(id: number) {
    const res = await this.request<any>(`/teacher-wallet/payout-requests/${id}/approve`, {
      method: 'POST',
    });
    return (res.data as any)?.data ?? res.data;
  }

  async rejectTeacherPayout(id: number, notes?: string) {
    const res = await this.request<any>(`/teacher-wallet/payout-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    return (res.data as any)?.data ?? res.data;
  }

  // -------------------------------------------------------------------------
  // Affiliates
  // -------------------------------------------------------------------------

  async checkAffiliatePhone(phone: string): Promise<{ exists: boolean; name?: string }> {
    const res = await this.request<any>(
      `/affiliates/check-phone?phone=${encodeURIComponent(phone)}`,
    );
    return res.data ?? res;
  }

  async createAffiliateAccount(data: {
    affiliate_name: string;
    phone: string;
    password?: string;
    commission_rate: number;
    send_sms?: boolean;
  }) {
    const res = await this.request<any>('/affiliates/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async confirmPhoneOtp(temp_token: string, otp: string) {
    const res = await this.request<any>('/auth/confirm-phone', {
      method: 'POST',
      body: JSON.stringify({ temp_token, otp }),
    });
    return res.data;
  }

  async setNewPassword(temp_token: string, new_password: string) {
    const res = await this.request<any>('/auth/set-new-password', {
      method: 'POST',
      body: JSON.stringify({ temp_token, new_password }),
    });
    return res.data;
  }

  async deactivateAffiliate(id: number) {
    const res = await this.request<any>(`/affiliates/${id}/deactivate`, {
      method: 'PATCH',
      body: '{}',
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getAffiliates() {
    const res = await this.request<any>('/affiliates');
    return (res.data as any)?.data ?? res.data;
  }

  async getMyAffiliateLinks() {
    const res = await this.request<any>('/affiliates/my');
    return (res.data as any)?.data ?? res.data ?? [];
  }

  async requestAffiliateWithdrawal(linkId: number, amount: number) {
    const res = await this.request<any>(`/affiliates/my/${linkId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return (res.data as any)?.data ?? res.data;
  }

  async getAffiliateWithdrawals(status?: string) {
    const qs = status ? `?status=${status}` : '';
    const res = await this.request<any>(`/affiliates/withdrawals${qs}`);
    return (res.data as any)?.data ?? res.data ?? [];
  }
}
