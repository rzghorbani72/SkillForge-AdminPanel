import { ApiLayer12 } from './12-review-academy-enamad';

import { unwrapData, unwrapDataEnvelope } from '../helpers';
import type { AcademySettlementDetail, AcademySettlementTable } from '@/types/financial';
import type { StoreFinancialRecord } from '@/types/api';
import type {
  ChurnMonth,
  CohortCell,
  FlatMetrics,
  MetricsActivity,
  MetricsCatalog,
  MetricsCurrency,
  MetricsLearningRecord,
  MetricsQuery,
  MetricsRegistrations,
  MetricsRetention,
  MetricsTransactions,
  MetricsUnitEconomics,
  MrrBridgeMonth,
  SubscriptionMetricRow,
  UserRetentionCell,
} from '../types-2';
import type { MetricSnapshotRow, MetricsReconciliation, TimeToValueRow } from '../types-3';

export class ApiLayer13 extends ApiLayer12 {
  async validateDiscount(
    code: string,
    amount: number,
    user_id?: string,
    options?: { academy_id?: string | null; profile_id?: string },
  ) {
    const response = await this.request<{
      discount_code_id: string;
      discount_code: string;
      discount_type: string;
      coupon_type: string;
      discount_value: number;
      free_trial_days: number | null;
      original_amount: number;
      discount_amount: number;
      final_amount: number;
    }>('/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({
        code,
        amount,
        user_id,
        academy_id: options?.academy_id,
        profile_id: options?.profile_id,
      }),
    });

    return unwrapDataEnvelope(response.data);
  }

  // ============================================================================
  // FINANCIAL MANAGEMENT API METHODS
  // ============================================================================

  // Cost Categories
  async getCostCategories() {
    const response = await this.request<unknown>('/financial/cost-categories', {
      method: 'GET',
    });
    return unwrapData<unknown[]>(response.data);
  }

  async createCostCategory(data: { name: string; description?: string; is_active?: boolean }) {
    const response = await this.request<unknown>('/financial/cost-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(response.data);
  }

  async updateCostCategory(
    id: number,
    data: Partial<{ name: string; description?: string; is_active?: boolean }>,
  ) {
    const response = await this.request<unknown>(`/financial/cost-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(response.data);
  }

  async deleteCostCategory(id: number) {
    const response = await this.request<unknown>(`/financial/cost-categories/${id}`, {
      method: 'DELETE',
    });
    return unwrapData<unknown>(response.data);
  }

  async getAcademyFinancialRecords(params?: {
    academy_id?: string;
    cost_category_id?: number;
    period_start?: string;
    period_end?: string;
    year?: number;
    month?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id) queryParams.append('academy_id', params.academy_id.toString());
    if (params?.cost_category_id)
      queryParams.append('cost_category_id', params.cost_category_id.toString());
    if (params?.period_start) queryParams.append('period_start', params.period_start);
    if (params?.period_end) queryParams.append('period_end', params.period_end);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());

    const url = `/financial/academy-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<unknown>(url, { method: 'GET' });
    return unwrapData<StoreFinancialRecord[]>(response.data);
  }

  async getAcademyFinancialSummary(academyId?: string) {
    const url = `/financial/academy-records/summary${academyId ? `?academy_id=${academyId}` : ''}`;
    const response = await this.request<unknown>(url, { method: 'GET' });
    return unwrapData<unknown>(response.data);
  }

  async getAcademyRevenueFromPayments(academyId?: string, startDate?: string, endDate?: string) {
    const queryParams = new URLSearchParams();
    if (academyId) queryParams.append('academy_id', academyId.toString());
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const url = `/financial/academy/revenue${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<unknown>(url, { method: 'GET' });
    return unwrapData<unknown>(response.data);
  }

  async getMonetizationSummary(params?: {
    academy_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id) {
      queryParams.append('academy_id', params.academy_id.toString());
    }
    if (params?.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params?.end_date) {
      queryParams.append('end_date', params.end_date);
    }

    const url = `/financial/monetization/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<unknown>(url, { method: 'GET' });
    return unwrapData<unknown>(response.data);
  }

  async getIranSettlementStatement(params?: {
    academy_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id) {
      queryParams.append('academy_id', params.academy_id.toString());
    }
    if (params?.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params?.end_date) {
      queryParams.append('end_date', params.end_date);
    }
    const url = `/financial/settlement${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<unknown>(url, { method: 'GET' });
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return unwrapData<unknown>(response.data);
    }
    return unwrapData<unknown>(response.data);
  }

  async getAcademySettlementTable(params?: {
    page?: number;
    limit?: number;
    search?: string;
    uuid?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    const url = `/financial/academies/settlement-table${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<unknown>(url, { method: 'GET' });
    return unwrapData<AcademySettlementTable>(response.data);
  }

  async getAcademySettlementDetail(academyId: string) {
    const response = await this.request<unknown>(`/financial/academies/${academyId}/settlement`, {
      method: 'GET',
    });
    return unwrapData<AcademySettlementDetail>(response.data);
  }

  async settleAcademy(
    academyId: string,
    payload: {
      bank_transaction_code: string;
      amount?: number;
      note?: string;
    },
  ) {
    const response = await this.request<unknown>(
      `/financial/settlement/academies/${academyId}/settle`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return unwrapData<unknown>(response.data);
  }

  async getIranSettlementReconciliation(params?: {
    academy_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id) queryParams.append('academy_id', params.academy_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const url = `/financial/settlement/reconciliation${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<unknown>(url, { method: 'GET' });
    return unwrapData<unknown>(response.data);
  }

  async lockIranFinancialPeriod(data: { academy_id: string; lock_until: string }) {
    const response = await this.request<unknown>('/financial/settlement/lock', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(response.data);
  }

  async setTeacherRevenueVisibility(data: {
    academy_id: string;
    teacher_id: number;
    is_visible: boolean;
  }) {
    const response = await this.request<unknown>('/financial/teacher-revenue-visibility', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapData<unknown>(response.data);
  }

  // -------------------------------------------------------------------------
  // Platform metrics (investor report) — PLATFORM_OWNER / ADMIN / FINANCE only
  // -------------------------------------------------------------------------

  protected metricsQuery(query: MetricsQuery = {}): string {
    const params = new URLSearchParams();
    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);
    if (query.academy_id) params.append('academy_id', query.academy_id);
    if (query.currency) params.append('currency', query.currency);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  protected async metrics<T>(path: string, query: MetricsQuery = {}): Promise<T> {
    const res = await this.request<T>(`/platform-metrics/${path}${this.metricsQuery(query)}`);
    return res.data as T;
  }

  async getMetricsOverview(query?: MetricsQuery) {
    return this.metrics<{
      currency: MetricsCurrency;
      eur_rate: number;
      metrics: FlatMetrics;
    }>('overview', query);
  }

  async getMetricsRevenue(query?: MetricsQuery) {
    return this.metrics<{
      currency: MetricsCurrency;
      bridge: MrrBridgeMonth[];
      retention: MetricsRetention;
    }>('revenue', query);
  }

  async getMetricsSubscriptions(query?: MetricsQuery) {
    return this.metrics<{
      currency: MetricsCurrency;
      rows: SubscriptionMetricRow[];
    }>('subscriptions', query);
  }

  async getMetricsTransactions(query?: MetricsQuery) {
    return this.metrics<MetricsTransactions>('transactions', query);
  }

  async getMetricsUsers(query?: MetricsQuery) {
    return this.metrics<MetricsRegistrations>('users', query);
  }

  async getMetricsActivity(query?: MetricsQuery) {
    return this.metrics<MetricsActivity>('activity', query);
  }

  async getMetricsCohorts(query?: MetricsQuery) {
    return this.metrics<{
      currency: MetricsCurrency;
      revenue_cohorts: CohortCell[];
      login_cohorts: UserRetentionCell[];
    }>('cohorts', query);
  }

  async getMetricsChurn(query?: MetricsQuery) {
    return this.metrics<{
      churn: ChurnMonth[];
      trials: {
        trials_started: number;
        trials_converted: number;
        conversion_rate: number | null;
        median_days_to_convert: number | null;
      };
    }>('churn', query);
  }

  async getMetricsCatalog(query?: MetricsQuery) {
    return this.metrics<MetricsCatalog>('catalog', query);
  }

  async getMetricsLearningRecord(query?: MetricsQuery) {
    return this.metrics<MetricsLearningRecord>('learning-record', query);
  }

  async getMetricsTimeToValue(query?: MetricsQuery) {
    return this.metrics<TimeToValueRow[]>('time-to-value', query);
  }

  async getMetricsUnitEconomics(query?: MetricsQuery) {
    return this.metrics<MetricsUnitEconomics>('unit-economics', query);
  }

  async getMetricsReconciliation(query?: MetricsQuery) {
    return this.metrics<MetricsReconciliation>('reconciliation', query);
  }

  async getMetricsSnapshots(query?: MetricsQuery) {
    return this.metrics<{
      currency: MetricsCurrency;
      snapshots: MetricSnapshotRow[];
    }>('snapshots', query);
  }
}
