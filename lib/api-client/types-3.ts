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
