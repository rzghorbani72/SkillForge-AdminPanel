export interface SupportInboxResult {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
}

export interface PlanLimitUsageEntry {
  limit: number;
  used: number;
}

export type PlanLimitUsageSnapshot = Record<string, PlanLimitUsageEntry>;

export interface AcademyHealthView {
  id: string;
  name: string;
  slug: string;
  plan_slug: string | null;
  expires_at: string | null;
  created_at?: string;
  manager_name?: string | null;
  monthly_revenue?: number;
  student_count?: number;
  course_count?: number;
  open_ticket_count?: number;
  closed_ticket_count?: number;
  wallet_balance?: number;
  pending_settlement_amount?: number;
  to_deposit?: number;
  pending_withdrawal_count?: number;
  bank_account_approved?: boolean;
  kyc_verified?: boolean;
  limits?: PlanLimitUsageSnapshot;
}

/** `target` plus the ids it needs; see lib/notifications/notification-href.ts. */
export type NotificationLink = Readonly<Record<string, string>>;

export interface PanelNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link: NotificationLink | null;
}

export interface NotificationListResponse {
  notifications: PanelNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type PlatformBroadcastAudience = 'ALL_MANAGERS' | 'ALL_TEACHERS' | 'SELECTED_ACADEMIES';

export interface PlatformBroadcast {
  id: string;
  title: string;
  body: string;
  audience: PlatformBroadcastAudience;
  status: 'DRAFT' | 'SENT';
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
}

export interface CreatePlatformBroadcastPayload {
  title: string;
  body: string;
  audience: PlatformBroadcastAudience;
  academy_ids?: string[];
}

export type DashboardBannerState = 'COMPLETED' | 'INCOMPLETE';

export interface DashboardBanner {
  id: string;
  state: DashboardBannerState;
  image_id: string;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface StorageObject {
  key: string;
  size: number;
  last_modified: string | null;
  academy_id: string | null;
  academy_name: string | null;
  used: boolean;
  title?: string | null;
}

export interface StorageInventory {
  objects: StorageObject[];
  total_bytes: number;
  unused_bytes: number;
}

export interface DeleteStorageObjectsResult {
  deleted: string[];
  refused: string[];
}

export interface CreateDashboardBannerPayload {
  image_id: string;
  state: DashboardBannerState;
  link_url?: string;
}

export interface UpdateDashboardBannerPayload {
  state?: DashboardBannerState;
  is_active?: boolean;
  sort_order?: number;
  link_url?: string;
}

export interface AcademyDashboardBanners {
  state: DashboardBannerState;
  has_template: boolean;
  has_course: boolean;
  banners: {
    id: string;
    image_id: string;
    image_url: string;
    link_url: string | null;
  }[];
}

export interface GatewayConfigData {
  id: string;
  name: string;
  display_name: string;
  country_code: string;
  region: string;
  supported_currencies: string[];
  is_active: boolean;
  is_sandbox: boolean;
  config_schema: {
    token: string | null;
    token_configured: boolean;
    terminal_id?: string;
    merchant_id?: string;
    callback_url?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface GatewayRegistryStatus {
  provider: string;
  configured: boolean;
  implemented: boolean;
}

// ---------------------------------------------------------------------------
// Platform metrics (investor report)
// ---------------------------------------------------------------------------

export type MetricsCurrency = 'TOMAN' | 'EUR';

/** Flat metric map: money keys already converted to the requested currency. */
export type FlatMetrics = Record<string, number | null>;

export interface MetricsQuery {
  from?: string;
  to?: string;
  academy_id?: string;
  currency?: MetricsCurrency;
}

export interface MrrBridgeMonth {
  month: string;
  starting_mrr: number;
  new_mrr: number;
  expansion_mrr: number;
  contraction_mrr: number;
  churned_mrr: number;
  ending_mrr: number;
  paying_academies: number;
  arpa: number;
  by_plan: Record<string, number>;
}

export interface MetricsRetention {
  nrr: number | null;
  grr: number | null;
  logo_retention: number | null;
}

export interface SubscriptionMetricRow {
  academy_id: string;
  academy_name: string;
  plan_slug: string;
  status: string;
  is_trial: boolean;
  expires_at: string | null;
  last_invoice_starts_at: string | null;
  last_invoice_ends_at: string | null;
  last_invoice_amount: number;
  last_term_months: number | null;
  first_paid_at: string | null;
  lifetime_paid: number;
  paid_invoice_count: number;
}

export interface ChurnMonth {
  month: string;
  starting_academies: number;
  churned_academies: number;
  new_academies: number;
  logo_churn_rate: number | null;
}

export interface CohortCell {
  cohort: string;
  month_index: number;
  academies: number;
  retained_academies: number;
  mrr: number;
  retention: number | null;
}

export interface UserRetentionCell {
  cohort: string;
  month_index: number;
  users: number;
  retained: number;
  retention: number | null;
}

export interface MetricsActivity {
  login_history_since: string | null;
  dau: number;
  wau: number;
  mau: number;
  stickiness: number | null;
  logins_per_active_user_per_week: number | null;
  daily_active: Array<{ day: string; users: number }>;
  monthly_logins: Array<{ month: string; value: number }>;
}

export interface MetricsRegistrations {
  total_users: number;
  total_profiles: number;
  activated_profiles: number;
  activation_rate: number | null;
  active_last_7d: number;
  active_last_30d: number;
  by_role: Array<{ role: string; profiles: number }>;
  monthly: Array<{ month: string; value: number }>;
}

export interface MetricsCatalog {
  total_courses: number;
  published_courses: number;
  by_course_type: Array<{ course_type: string; courses: number }>;
  by_pricing_type: Array<{ pricing_type: string; courses: number }>;
  by_lesson_type: Array<{ lesson_type: string; lessons: number }>;
  total_lessons: number;
  live_sessions: number;
  tutoring_offers_solo: number;
  tutoring_offers_group: number;
  tutoring_engagements_solo: number;
  tutoring_engagements_group: number;
  monthly_courses_created: Array<{ month: string; value: number }>;
}

export interface MetricsLearningRecord {
  quiz_attempts: number;
  assignment_submissions: number;
  graded_submissions: number;
  discussion_messages: number;
  live_attendance_records: number;
  tutoring_attendance_records: number;
  certificates_issued: number;
  total_records: number;
  monthly_records: Array<{ month: string; value: number }>;
}

export interface MetricsTransactions {
  currency: MetricsCurrency;
  paid_count: number;
  paid_amount: number;
  attempted_count: number;
  checkout_success_rate: number | null;
  refunded_amount: number;
  refund_rate: number | null;
  open_refund_requests: number;
  by_status: Array<{ key: string; count: number; amount: number }>;
  by_provider: Array<{ key: string; count: number; amount: number }>;
  by_method: Array<{ key: string; count: number; amount: number }>;
  monthly: Array<{ month: string; count: number; amount: number }>;
}

export interface MetricsUnitEconomics {
  currency: MetricsCurrency;
  marketing_spend: number;
  new_paying_academies: number;
  cac: number | null;
  arpa: number | null;
  gross_margin: number | null;
  cac_payback_months: number | null;
  monthly_logo_churn: number | null;
  ltv: number | null;
  ltv_to_cac: number | null;
  quick_ratio: number | null;
  mrr_growth_annualised: number | null;
  rule_of_40: number | null;
  monthly_burn: number | null;
  runway_months: number | null;
  caveats: string[];
}

export interface ReconciliationLeg {
  matched: number;
  missing: number;
  orphan: number;
  missing_ids: string[];
  orphan_ids: string[];
}
