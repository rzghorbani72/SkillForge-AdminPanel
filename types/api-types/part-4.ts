import type { FormulaScope } from './part-3';

export interface CostCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreFinancialRecord {
  id: number;
  academy_id: string;
  cost_category_id?: number;
  period_start: string;
  period_end: string;
  revenue: number;
  cost: number;
  profit: number;
  formula_adjustment: number;
  final_profit: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  store?: {
    id: number;
    name: string;
    slug: string;
  };
  costCategory?: CostCategory;
}

export interface PlatformFinancialRecord {
  id: number;
  cost_category_id?: number;
  period_start: string;
  period_end: string;
  revenue: number;
  cost: number;
  profit: number;
  formula_adjustment: number;
  final_profit: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  costCategory?: CostCategory;
}

export type FormulaType = 'REVENUE' | 'COST' | 'BENEFIT';

export type AdjustmentType = 'AUTOMATIC' | 'MANUAL' | 'GIFT' | 'INCENTIVE';

export type FormulaTemplate =
  | 'SIMPLE'
  | 'PERCENTAGE_OF'
  | 'FIXED_AMOUNT'
  | 'PERCENTAGE_BONUS'
  | 'CUSTOM';

export type FormulaOperation = 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE' | 'PERCENTAGE' | 'FIXED';

export type FormulaVariable = 'REVENUE' | 'COST' | 'PROFIT' | 'FINAL_PROFIT';

export interface FormulaStep {
  operation: FormulaOperation;
  value?: number | string;
  variable?: FormulaVariable;
  percentage?: number;
}

export interface FinancialFormula {
  id: number;
  name: string;
  description?: string;
  formula: {
    steps: FormulaStep[];
    template?: FormulaTemplate;
  };
  template: FormulaTemplate;
  type: FormulaType;
  scope: FormulaScope;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormulaApplication {
  id: number;
  formula_id: number;
  academy_id?: string;
  period_start: string;
  period_end: string;
  adjustment_type: AdjustmentType;
  adjustment_amount?: number;
  adjustment_percent?: number;
  reason?: string;
  is_applied: boolean;
  applied_at?: string;
  applied_by?: number;
  created_at: string;
  updated_at: string;
  formula?: FinancialFormula;
  store?: {
    id: number;
    name: string;
    slug: string;
  };
  applier?: {
    id: number;
    display_name: string;
  };
}

export interface FinancialSummary {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  record_count: number;
  currency: string;
  vat_rate?: number;
  platform_commission_rate?: number;
}

export interface PlatformFinancialSummary {
  platform: FinancialSummary;
  stores: FinancialSummary;
  total: FinancialSummary;
  vat_rate?: number;
  platform_commission_rate?: number;
}

export type OfferingType = 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'PRIVATE' | 'PAYMENT_PLAN';

export interface OfferCourseRef {
  Course: { id: string; title: string; slug: string };
}

export interface PaymentPlan {
  id: string;
  course_id: string;
  installment_count: number;
  amount_per_installment: number;
  interval_days: number;
  is_active: boolean;
}

export interface Offer {
  id: string;
  academy_id: string;
  type: OfferingType;
  title: string | null;
  slug: string | null;
  description: string | null;
  price: number;
  /** Price before discount, shown struck through. Null = no discount shown. */
  compare_at_price: number | null;
  currency: string;
  access_duration_days: number | null;
  /** False sells the recorded course only — the buyer never sees the live link. */
  includes_live: boolean;
  is_active: boolean;
  /** Set only on a PAYMENT_PLAN offer — the installment plan it charges through. */
  payment_plan_id: string | null;
  /** Set when this offer IS the course's own price — edit the course instead. */
  source_course_id: string | null;
  created_at: string;
  Courses: OfferCourseRef[];
}

export interface OfferInput {
  course_ids: string[];
  type: OfferingType;
  price?: number;
  compare_at_price?: number | null;
  title?: string;
  slug?: string;
  description?: string;
  access_duration_days?: number | null;
  includes_live?: boolean;
  is_active?: boolean;
  payment_plan_id?: string | null;
}
