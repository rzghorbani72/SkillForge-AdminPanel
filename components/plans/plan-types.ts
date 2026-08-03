import { SubscriptionPlanData, StructuredPlanLimits } from '@/lib/api';

export type { SubscriptionPlanData, StructuredPlanLimits };

export interface AcademyPlanData {
  id: number;
  academy_id: string;
  kind: 'SUBSCRIPTION' | 'PACKAGE';
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanFormData {
  name: string;
  slug: string;
  price_monthly: string;
  price_yearly: string;
  storage_limit_gb: string;
  features: string;
  is_active: boolean;
  sort_order: string;
}

export interface AcademyPlanFormData {
  kind: 'SUBSCRIPTION' | 'PACKAGE';
  name: string;
  description: string;
  price: string;
  duration_days: string;
  is_active: boolean;
}

// Distinct from AcademyPlanData above (an academy's own student-facing products).
export interface AcademyCustomPlanData {
  custom_plan_enabled: boolean;
  custom_plan_name: string | null;
  custom_plan_limits: StructuredPlanLimits | null;
  custom_plan_features: string[] | null;
  custom_plan_price_monthly: number | null;
  custom_plan_price_yearly: number | null;
  custom_plan_note: string | null;
  custom_plan_assigned_at: string | null;
  custom_plan_assigned_by: string | null;
}

export interface AcademyCustomPlanFormData {
  name: string;
  limits: Record<keyof StructuredPlanLimits, string>;
  features: string;
  price_monthly_toman: string;
  price_yearly_toman: string;
  note: string;
}

export const DEFAULT_CUSTOM_PLAN_FORM: AcademyCustomPlanFormData = {
  name: '',
  limits: {
    managers: '1',
    teachers: '1',
    courses: '1',
    seasons_per_course: '5',
    lessons_per_course: '50',
    tutoring_students: '10',
    storage_gb: '10',
    live_classes_per_month: '8',
    videos: '10'
  },
  features: '',
  price_monthly_toman: '',
  price_yearly_toman: '',
  note: ''
};

export const DEFAULT_PLAN_FORM: PlanFormData = {
  name: '',
  slug: '',
  price_monthly: '0',
  price_yearly: '',
  storage_limit_gb: '50',
  features: '',
  is_active: true,
  sort_order: '0'
};

export const DEFAULT_ACADEMY_PLAN_FORM: AcademyPlanFormData = {
  kind: 'SUBSCRIPTION',
  name: '',
  description: '',
  price: '0',
  duration_days: '',
  is_active: true
};

export const PERIOD_OPTIONS = [
  { months: 1, key: 'months1' },
  { months: 3, key: 'months3' },
  { months: 6, key: 'months6' },
  { months: 12, key: 'months12' }
] as const;

// Mirrors the public landing's curated per-plan checklist
// (edusphere landing.messages `pricing.plans[].features`) so the manager
// panel's plan cards read identically to the marketing pricing page.
// Keyed by plan slug; falls back to the plan's own `features` when unknown.
export const PLAN_FEATURE_LIST_FA: Record<string, readonly string[]> = {
  starter: [
    '۲ معلم',
    '۱۲۵ دانشجوی تدریس خصوصی',
    '۳۰ گیگابایت فضا',
    'فروش عمومی نامحدود',
    'دامنه اختصاصی',
    'بدون کارمزد فروش'
  ],
  growth: [
    '۵ معلم',
    '۳۵۰ دانشجوی تدریس خصوصی',
    '۹۰ گیگابایت فضا',
    'فروش عمومی نامحدود',
    'دامنه اختصاصی',
    '۲ مدیر'
  ],
  business: [
    '۱۵ معلم',
    '۹۰۰ دانشجوی تدریس خصوصی',
    '۲۰۰ گیگابایت فضا',
    'فروش عمومی نامحدود',
    '۵ مدیر',
    'دامنه اختصاصی'
  ]
};

export function planFeatureList(
  slug: string,
  fallback: readonly string[] | null | undefined
): readonly string[] {
  return PLAN_FEATURE_LIST_FA[slug] ?? fallback ?? [];
}

export function formatPrice(price: number) {
  return price.toLocaleString('fa-IR');
}

export function formatStorage(gb: number) {
  const isTb = gb >= 1000;
  const value = isTb ? Math.round(gb / 1000) : gb;
  return `${value.toLocaleString('fa-IR')} ${isTb ? 'TB' : 'GB'}`;
}
