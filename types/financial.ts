export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

/** The only two outcomes the academy financial page reports on. */
export type SettledPaymentStatus = Extract<PaymentStatus, 'PAID' | 'FAILED'>;

/** A row of `GET /payments` — student money paid to the academy. */
export interface AcademyPaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string | null;
  provider?: string | null;
  gateway?: string | null;
  created_at: string;
  discount_amount?: number | null;
  /** Store credit spent on this checkout; `amount` is the cash part. */
  credit_amount?: number | null;
  coupon_code?: string | null;
  vat_amount?: number | null;
  platform_fee?: number | null;
  school_net_revenue?: number | null;
  refund_amount?: number | null;
  Profile?: { display_name?: string | null } | null;
  Course?: { title?: string | null } | null;
}

export interface PaymentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AcademyPaymentsResponse {
  payments: AcademyPaymentRow[];
  pagination: PaymentsPagination;
}

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

export type LedgerPaymentKind = 'academy_sale' | 'platform_plan';

export interface LedgerPaymentRow {
  id: string;
  kind: LedgerPaymentKind;
  academy_id: string | null;
  academy_name: string | null;
  course_title: string | null;
  gross_amount: number;
  /** The gateway's own Rial figure; null when no gateway has confirmed one. */
  bank_amount: number | null;
  bank_ref: string | null;
  academy_share: number;
  platform_share: number;
  currency: string;
  gateway: string | null;
  paid_at: string;
}

export interface LedgerPaymentsResponse {
  total: number;
  page: number;
  limit: number;
  payments: LedgerPaymentRow[];
}

export interface DeskAcademyRow {
  academy_id: string;
  academy_name: string;
  academy_slug: string;
  wallet_balance: number;
  pending_amount: number;
  to_deposit: number;
  withdrawn_total: number;
  last_settled_at: string | null;
  last_tracking_code: string | null;
  last_withdrawal_id: string | null;
  informed: boolean;
  informed_sms: boolean;
  informed_email: boolean;
}

export interface DeskSettlementRow {
  id: string;
  academy_id: string;
  academy_name: string;
  amount: number;
  processed_at: string | null;
  tracking_code: string | null;
  informed: boolean;
  informed_sms: boolean;
  informed_email: boolean;
}

export interface DeskGrossPoint {
  period: string;
  academy_gross: number;
  platform_gross: number;
  academy_cumulative: number;
  platform_cumulative: number;
}

export interface SettlementDesk {
  to_deposit: number;
  pending_amount: number;
  academy_share: number;
  platform_share: number;
  academies: DeskAcademyRow[];
  settlements: DeskSettlementRow[];
  gross_trend: DeskGrossPoint[];
}

export interface WithdrawalRequestRow {
  id: string;
  amount: number | null;
  status: string;
  requested_at?: string | null;
  bank_transaction_code?: string | null;
  academy?: { name?: string } | null;
}

export interface TeacherPayoutRequestRow {
  id: string;
  amount: number | null;
  status: string;
  requested_at?: string | null;
  bank_info?: string | null;
  academy?: { name?: string } | null;
  profile?: { display_name?: string } | null;
  teacher?: { name?: string } | null;
}

export interface PaymentPlanRow {
  id: string;
  installment_count: number;
  amount_per_installment: number;
  interval_days: number;
  is_active: boolean;
}

export interface RefundEligibility {
  max_refundable?: number;
  reason?: string;
}
