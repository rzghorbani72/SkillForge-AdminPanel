import { ApiLayer13 } from './13-validate-discount';

import type { MetricsQuery } from '../types-2';
import type { MarketingSpendRow, PlatformCostRow } from '../types-3';

export class ApiLayer14 extends ApiLayer13 {
  async runMetricsSnapshot(months?: number) {
    const res = await this.request<{
      months_written: number;
      months_skipped: number;
      academies: number;
    }>(`/platform-metrics/snapshot/tick${months ? `?months=${months}` : ''}`, {
      method: 'POST',
    });
    return res.data;
  }

  async getPlatformCosts(query?: MetricsQuery) {
    return this.metrics<PlatformCostRow[]>('costs', query);
  }

  async createPlatformCost(input: {
    amount_toman: number;
    paid_at: string;
    description: string;
    category: string;
    subcategory: string;
  }) {
    const res = await this.request<PlatformCostRow>('/platform-metrics/costs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  }

  async deletePlatformCost(id: string) {
    const res = await this.request<{ deleted: true }>(`/platform-metrics/costs/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  async getMarketingSpend(query?: MetricsQuery) {
    return this.metrics<MarketingSpendRow[]>('marketing-spend', query);
  }

  async upsertMarketingSpend(input: {
    period_start: string;
    period_end: string;
    amount: number;
    channel: string;
    note?: string;
  }) {
    const res = await this.request<MarketingSpendRow>('/platform-metrics/marketing-spend', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  }

  /**
   * The full diligence bundle: every section in one file.
   * Fetched as a Blob so the browser saves it instead of rendering it.
   */
  async downloadMetricsDataRoom(
    query: MetricsQuery = {},
    format: 'csv' | 'json' = 'csv',
  ): Promise<Blob> {
    const params = this.metricsQuery(query);
    const separator = params ? '&' : '?';
    const url = `${this.baseURL}/platform-metrics/export/data-room${params}${separator}format=${format}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to export metrics: ${response.status}`);
    }
    return response.blob();
  }

  async downloadMetricsSection(section: string, query: MetricsQuery = {}): Promise<Blob> {
    const params = this.metricsQuery(query);
    const separator = params ? '&' : '?';
    const url = `${this.baseURL}/platform-metrics/export${params}${separator}section=${section}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to export section: ${response.status}`);
    }
    return response.blob();
  }

  async exportIranSettlementCsv(params?: {
    academy_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.academy_id) queryParams.append('academy_id', params.academy_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const endpoint = `/financial/settlement/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to export CSV: ${response.status}`);
    }

    return response.blob();
  }

  async getAcademyFinancialOverview(academyId?: string, startDate?: string, endDate?: string) {
    const queryParams = new URLSearchParams();
    if (academyId) queryParams.append('academy_id', academyId.toString());
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const url = `/financial/academy/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any;
  }

  async createAcademyFinancialRecord(data: {
    academy_id: string;
    cost_category_id?: number;
    period_start: string;
    period_end: string;
    revenue: number;
    cost: number;
    currency?: string;
    notes?: string;
  }) {
    const response = await this.request<any>('/financial/academy-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async updateAcademyFinancialRecord(
    id: number,
    data: Partial<{
      academy_id?: string;
      cost_category_id?: number;
      period_start?: string;
      period_end?: string;
      revenue?: number;
      cost?: number;
      currency?: string;
      notes?: string;
    }>,
  ) {
    const response = await this.request<any>(`/financial/academy-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async deleteAcademyFinancialRecord(id: number) {
    const response = await this.request<any>(`/financial/academy-records/${id}`, {
      method: 'DELETE',
    });
    return response.data as any;
  }

  // Platform Financial Records
  async getPlatformFinancialRecords(params?: {
    cost_category_id?: number;
    period_start?: string;
    period_end?: string;
    year?: number;
    month?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.cost_category_id)
      queryParams.append('cost_category_id', params.cost_category_id.toString());
    if (params?.period_start) queryParams.append('period_start', params.period_start);
    if (params?.period_end) queryParams.append('period_end', params.period_end);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());

    const url = `/financial/platform-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any[];
  }

  async getPlatformFinancialSummary() {
    const response = await this.request<any>('/financial/platform-records/summary', {
      method: 'GET',
    });
    return response.data as any;
  }

  async createPlatformFinancialRecord(data: {
    cost_category_id?: number;
    period_start: string;
    period_end: string;
    revenue: number;
    cost: number;
    currency?: string;
    notes?: string;
  }) {
    const response = await this.request<any>('/financial/platform-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async updatePlatformFinancialRecord(
    id: number,
    data: Partial<{
      cost_category_id?: number;
      period_start?: string;
      period_end?: string;
      revenue?: number;
      cost?: number;
      currency?: string;
      notes?: string;
    }>,
  ) {
    const response = await this.request<any>(`/financial/platform-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async deletePlatformFinancialRecord(id: number) {
    const response = await this.request<any>(`/financial/platform-records/${id}`, {
      method: 'DELETE',
    });
    return response.data as any;
  }

  // Financial Formulas
  async getFinancialFormulas(scope?: string) {
    const url = `/financial/formulas${scope ? `?scope=${scope}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any[];
  }

  async getFinancialFormula(id: number) {
    const response = await this.request<any>(`/financial/formulas/${id}`, {
      method: 'GET',
    });
    return response.data as any;
  }

  async createFinancialFormula(data: {
    name: string;
    description?: string;
    template: 'SIMPLE' | 'PERCENTAGE_OF' | 'FIXED_AMOUNT' | 'PERCENTAGE_BONUS' | 'CUSTOM';
    steps: Array<{
      operation: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE' | 'PERCENTAGE' | 'FIXED';
      value?: number | string;
      variable?: 'REVENUE' | 'COST' | 'PROFIT' | 'FINAL_PROFIT';
      percentage?: number;
    }>;
    type: 'REVENUE' | 'COST' | 'BENEFIT';
    scope: 'STORE' | 'PLATFORM';
    is_active?: boolean;
  }) {
    const response = await this.request<any>('/financial/formulas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async updateFinancialFormula(
    id: number,
    data: Partial<{
      name?: string;
      description?: string;
      template?: 'SIMPLE' | 'PERCENTAGE_OF' | 'FIXED_AMOUNT' | 'PERCENTAGE_BONUS' | 'CUSTOM';
      steps?: Array<{
        operation: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE' | 'PERCENTAGE' | 'FIXED';
        value?: number | string;
        variable?: 'REVENUE' | 'COST' | 'PROFIT' | 'FINAL_PROFIT';
        percentage?: number;
      }>;
      type?: 'REVENUE' | 'COST' | 'BENEFIT';
      is_active?: boolean;
    }>,
  ) {
    const response = await this.request<any>(`/financial/formulas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async deleteFinancialFormula(id: number) {
    const response = await this.request<any>(`/financial/formulas/${id}`, {
      method: 'DELETE',
    });
    return response.data as any;
  }

  async executeFormula(name: string, variables: Record<string, any>) {
    const response = await this.request<any>(`/financial/formulas/${name}/execute`, {
      method: 'POST',
      body: JSON.stringify(variables),
    });
    return response.data as { result: number };
  }

  // Formula Applications
  async createFormulaApplication(data: {
    formula_id: number;
    academy_id?: string;
    period_start: string;
    period_end: string;
    adjustment_type: 'AUTOMATIC' | 'MANUAL' | 'GIFT' | 'INCENTIVE';
    adjustment_amount?: number;
    adjustment_percent?: number;
    reason?: string;
    apply_immediately?: boolean;
  }) {
    const response = await this.request<any>('/financial/formula-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async getFormulaApplications(params?: { academy_id?: string; formula_id?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.academy_id) queryParams.append('academy_id', params.academy_id.toString());
    if (params?.formula_id) queryParams.append('formula_id', params.formula_id.toString());

    const url = `/financial/formula-applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as any[];
  }
}
