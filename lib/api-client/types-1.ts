export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

/**
 * Passed straight through to `fetch` by `request()`. React Query owns the
 * signal and aborts it on unmount or query-key change.
 */
export interface ReadOptions {
  signal?: AbortSignal;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Why the client stopped issuing new API calls (first 401/403 wins). */
export type ApiPauseReason = 'session' | 'legal';

export type LegalConsentRequiredDetail = {
  pending: { type: string; title: string; version: string }[];
};

export type LegalDiffPart = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

export type LegalPendingDocumentDiff = {
  type: string;
  title: string;
  version: string;
  previousVersion: string | null;
  diff: LegalDiffPart[] | null;
};

export type SubscriptionRequiredDetail = {
  message: string;
};

export interface AcademySubscriptionOverviewRow {
  academy_id: string;
  name: string;
  slug: string;
  plan_slug: string | null;
  custom_plan_name: string | null;
  status: string;
  days_remaining: number | null;
  grace_until: string | null;
  is_trial: boolean;
  data_at_risk: boolean;
  has_paid: boolean;
  storage_usage_gb: number;
  included_storage_gb: number;
  storage_overage_fee_irr: number;
}

export interface TrialClaimResult {
  academy_id: string;
  expires_at: string;
  days_remaining: number;
  moved_from_academy_id: string | null;
}

export interface AcademyFeatureFlags {
  enrollment_enabled: boolean;
  subscription_enabled: boolean;
  live_classes_enabled: boolean;
  tutor_led_learning_enabled: boolean;
}

export interface LearningNavCapabilities {
  course_scope: 'owned' | 'academy';
  selling_types: {
    one_time: boolean;
    public_sub: boolean;
    private_sub: boolean;
  };
  academy_features: {
    tutor_led_learning_enabled: boolean;
  };
  visibility: {
    students: boolean;
    assignments: boolean;
    ops_queue: boolean;
    tutoring: boolean;
  };
}

/** Quiz rules a teacher edits; mirrors the Backend `QuizSettingsDto`. */
export type QuizSettingsPayload = {
  pass_percent: number;
  questions_per_attempt: number | null;
  max_attempts: number | null;
  is_required: boolean;
  is_final: boolean;
};

export interface PlatformSettingsData {
  id: string;
  vat_rate: number;
  commission_rate: number;
  teacher_share_rate: number;
  storage_overage_fee_irr: number;
  subscription_grace_days: number;
  subscription_reminder_days: number;
  payment_release_phase: string;
  legal_entity_name: string | null;
  vat_registration_no: string | null;
  economic_code: string | null;
  owner_notify_phone: string | null;
  /** Unit costs (Toman) the plan margin check is run against. */
  cost_storage_per_gb_toman: number;
  cost_egress_per_gb_toman: number;
  cost_app_egress_per_gb_toman: number;
  cost_compute_base_per_academy_toman: number;
  cost_compute_per_student_toman: number;
  cost_sms_per_message_toman: number;
  cost_gateway_fee_rate: number;
  cost_platform_fixed_monthly_toman: number;
  /** One-shot capacity packs a manager can buy mid-period. */
  storage_addon_gb: number;
  storage_addon_price_toman: number;
  traffic_addon_gb: number;
  traffic_addon_price_toman: number;
  created_at: string;
  updated_at: string;
}

export interface StructuredPlanLimits {
  managers: number;
  teachers: number;
  courses: number;
  seasons_per_course: number;
  lessons_per_course: number;
  tutoring_students: number;
  storage_gb: number;
  /** Delivered media traffic allowed per calendar month, in GB. */
  monthly_traffic_gb: number;
  videos: number;
  dedicated_templates: number;
}

export interface PlanEconomicsPreview {
  ok: boolean;
  revenue: number;
  grossMarginPercent: number;
  cogsPercent: number;
  topCostDriver: 'storage' | 'egress' | 'compute' | 'sms' | 'gateway';
  storageCost: number;
  egressCost: number;
  appEgressCost: number;
  computeCost: number;
  smsCost: number;
  gatewayCost: number;
  cogs: number;
  grossProfit: number;
  streamedGb: number;
  streamedHours: number;
  breakEvenAcademies: number;
}

export type StorageMediaType = 'video' | 'image' | 'audio' | 'document';

export interface AcademyStorageTypeUsage {
  type: StorageMediaType;
  bytes: number;
  count: number;
}

export interface AcademyStorageUsage {
  total_bytes: number;
  limit_bytes: number;
  remaining_bytes: number;
  percent_used: number;
  warn_level: 'ok' | 'warning' | 'full';
  is_upload_blocked: boolean;
  by_type: AcademyStorageTypeUsage[];
}

export type StorageUsageArea =
  | 'lesson'
  | 'course'
  | 'course_cover'
  | 'session_recording'
  | 'academy_branding'
  | 'home_page'
  | 'profile_avatar'
  | 'article';

export interface StorageFileUsage {
  area: StorageUsageArea;
  label: string;
  /** The course a lesson belongs to, when there is one. */
  context?: string;
  href?: string;
}

export interface StorageFileRow {
  id: string;
  kind: StorageMediaType;
  title: string;
  size: number;
  mime_type: string | null;
  created_at: string;
  /** Where the file is used — the manager removes it from there, not here. */
  usages: StorageFileUsage[];
  /** Thumbnail source for images; null for every other kind. */
  preview_url: string | null;
}

export interface StorageFilesPage {
  rows: StorageFileRow[];
  total: number;
  page: number;
  limit: number;
}

export interface AcademySiteStatusData {
  disabled: boolean;
  disabled_at: string | null;
  disabled_until: string | null;
  message: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  /** Manager's registered platform phone — what students see; not editable. */
  default_contact_phone: string | null;
  open_obligations: {
    active_subscriptions: number;
    active_enrollments: number;
    total: number;
  };
}

export interface DisableAcademySitePayload {
  /** Optional: when enrollment reopens by itself (ISO string). Omit to stay closed. */
  disabled_until?: string;
  message?: string;
  contact_email?: string;
}

export interface SubscriptionPlanData {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number | null;
  commission_rate: number | null;
  storage_limit_gb: number;
  features: string[] | null;
  is_active: boolean;
  sort_order: number;
  limits?: StructuredPlanLimits | null;
  is_most_popular?: boolean;
  annual_months_included?: number | null;
  /** VAT rate as a decimal (e.g. 0.09 = 9%), charged on top of this price at checkout. */
  vat_rate?: number;
  created_at: string;
  updated_at: string;
}

// Prorated upgrade quote from `/academies/current/subscription/upgrade-quote`.
// Amounts ending in `_toman` mirror the manager-facing Toman prices; `_toman`
// can be negative for storage credit but `amount_toman` is floored at zero.
export interface AcademyUpgradeQuote {
  fromSlug: string;
  toSlug: string;
  remainingDays: number;
  /** Term the quote was priced on: 1 or 3 months. */
  periodMonths: number;
  isDowngrade: boolean;
  expiresAt: string | null;
  storage_usage_gb: number;
  amount_toman: number;
  plan_amount_toman: number;
  storage_amount_toman: number;
  target_full_period_toman: number;
  /** VAT rate as a decimal (e.g. 0.09 = 9%), charged on top of amount_toman at checkout. */
  vat_rate: number;
  vat_amount_toman: number;
  grand_total_toman: number;
  target_plan: {
    slug: string;
    name: string;
    price_monthly_toman: number;
    /** Renewal price on the term the academy is actually on. */
    price_period_toman: number;
    storage_gb: number;
  };
}

// Shape of the public, unauthenticated `/platform-settings/plans/active`
// pricing-page endpoint (see Backend PublicPlan). It has no `id`/`sort_order`
// and uses Toman-suffixed field names — never assume it matches
// SubscriptionPlanData without going through mapPublicPlanToSubscriptionPlan.
export interface PublicSubscriptionPlanData {
  slug: string;
  name: string;
  price_monthly_toman: number;
  price_yearly_toman: number | null;
  storage_gb: number;
  limits: StructuredPlanLimits;
  features: string[];
  is_most_popular: boolean;
  annual_months_included: number;
  commission_rate: number;
  vat_rate: number;
}

export interface SupportInboxQuery {
  status?: string;
  priority?: string;
  academy_id?: string;
  category?: string;
  team?: string;
  assigned_to?: string;
  unassigned?: boolean;
  mine?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SupportInboxSummary {
  teams: Array<{ team: string; count: number }>;
  unassigned: number;
  mine: number;
  total: number;
}
