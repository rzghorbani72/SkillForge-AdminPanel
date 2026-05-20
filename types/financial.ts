export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface PaymentFormulaFactors {
  vat_rate?: number;
  take_rate?: number;
  teacher_share_rate?: number;
}

export interface PaymentProfile {
  display_name?: string;
}

export interface PaymentCourse {
  title?: string;
}

export interface AcademyPayment {
  id: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  created_at: string;
  payment_date?: string;
  profile?: PaymentProfile;
  course?: PaymentCourse;
  formula_factors?: PaymentFormulaFactors;
  tax_vat_amount?: number;
  platform_fee?: number;
  instructor_fee?: number;
  school_net_revenue?: number;
}

export interface AcademyRevenueData {
  total_revenue: number;
  payment_count: number;
  currency: string;
  payments: AcademyPayment[];
}

export interface SettlementTotals {
  gross_amount: number;
  platform_fee: number;
  tax_vat_amount: number;
  teacher_payout: number;
  school_net_revenue: number;
  currency: string;
  vat_rate?: number;
}

export interface SettlementStatement {
  totals: SettlementTotals;
}

export interface ReconciliationData {
  total_paid_payments: number;
  matched_successful_callbacks: number;
  missing_successful_callbacks: number;
  orphan_successful_callbacks: number;
}

export interface OverviewRevenue {
  total: number;
  from_payments: number;
  currency: string;
}

export interface OverviewCost {
  total: number;
  currency: string;
}

export interface OverviewProfit {
  total: number;
  margin: number;
}

export interface OverviewStatistics {
  enrollments: number;
  courses: number;
}

export interface AcademyFinancialOverview {
  revenue: OverviewRevenue;
  cost: OverviewCost;
  profit: OverviewProfit;
  statistics: OverviewStatistics;
}

export interface MonetizationTeacher {
  teacher_id: number;
  name: string;
  revenue: number;
  share_rate: number;
  is_visible: boolean;
  currency: string;
}

export interface MonetizationSummary {
  role: string;
  platform_revenue?: number;
  school_revenue?: number;
  teacher_revenue?: number;
  teachers?: MonetizationTeacher[];
  currency: string;
  is_revenue_visible?: boolean;
  revenue_hidden_reason?: string;
}
