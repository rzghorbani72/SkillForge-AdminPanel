import type { FlatMetrics, MetricsCurrency, ReconciliationLeg } from './types-2';

export interface MetricsReconciliation {
  currency: MetricsCurrency;
  invoiced_amount: number;
  invoice_count: number;
  manual_invoice_count: number;
  manual_invoice_amount: number;
  invoice_to_payment: ReconciliationLeg;
  payment_to_gateway: ReconciliationLeg;
  balanced: boolean;
}

export interface MetricSnapshotRow {
  month: string;
  period_start: string;
  period_end: string;
  eur_rate: number;
  computed_at: string;
  backfilled: boolean;
  source_hash: string;
  metrics: FlatMetrics;
}

export interface TimeToValueRow {
  metric: string;
  academies_measured: number;
  median_days: number | null;
  p75_days: number | null;
}

export interface PlatformCostRow {
  id: string;
  amount: number;
  paid_at: string;
  description: string;
  category: string;
  subcategory: string;
}

export interface MarketingSpendRow {
  id: string;
  period_start: string;
  period_end: string;
  amount: number;
  channel: string;
  note: string | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StudentLessonAccessRecord {
  id: string;
  is_unlocked: boolean;
  note?: string;
  updated_at: string;
  Profile?: { id: string; display_name: string };
  Lesson?: { id: string; title: string; Season?: { id: string; course_id: string } };
  UnlockedBy?: { id: string; display_name: string };
}

export interface StudentLessonAccessList {
  list: StudentLessonAccessRecord[];
  pagination: PageMeta | null;
}

export interface AcademyCustomPlanData {
  custom_plan_enabled?: boolean;
  custom_plan_assigned_at?: string | null;
  custom_plan_name?: string | null;
  custom_plan_limits?: Record<string, number | string | null> | null;
  custom_plan_features?: string[] | null;
  custom_plan_price_monthly?: number | null;
  custom_plan_price_yearly?: number | null;
  custom_plan_note?: string | null;
}

export interface AcademyRecord {
  id?: string;
  name?: string;
  slug?: string;
}
