import type { StructuredPlanLimits } from '@/lib/api';

export const PLAN_LIMIT_KEYS: (keyof StructuredPlanLimits)[] = [
  'managers',
  'teachers',
  'courses',
  'seasons_per_course',
  'lessons_per_course',
  'tutoring_students',
  'storage_gb',
  'monthly_traffic_gb',
  'videos',
  'dedicated_templates'
];

/** Shape for a brand-new tier: Starter's envelope, which is the safe floor. */
export const DEFAULT_LIMITS: StructuredPlanLimits = {
  managers: 1,
  teachers: 2,
  courses: 5,
  seasons_per_course: 5,
  lessons_per_course: 50,
  tutoring_students: 60,
  storage_gb: 30,
  monthly_traffic_gb: 200,
  videos: 40,
  dedicated_templates: 1
};

export const irrToToman = (irr: number) => Math.round(irr / 10);
export const tomanToIrr = (toman: number) => Math.round(toman * 10);

export const formatToman = (toman: number) =>
  toman.toLocaleString('fa-IR') + ' تومان';

export const formatIRR = (v: number) => v.toLocaleString('fa-IR') + ' ریال';

export const toPercent = (rate: number) => +(rate * 100).toFixed(4);
export const fromPercent = (pct: number) => +(pct / 100).toFixed(6);

/**
 * The designed starting values for the three built-in tiers, shown as input
 * placeholders so the owner can always see what a field was set to at launch
 * next to whatever is live now. These are reference figures only — the saved
 * plan row is what the platform charges and enforces.
 */
export interface PlanDefaults {
  price_monthly_toman: number;
  price_quarterly_toman: number;
  limits: StructuredPlanLimits;
}

export const PLAN_DEFAULTS: Record<string, PlanDefaults> = {
  starter: {
    price_monthly_toman: 3_000_000,
    price_quarterly_toman: 8_500_000,
    limits: {
      managers: 1,
      teachers: 2,
      courses: 5,
      seasons_per_course: 5,
      lessons_per_course: 50,
      tutoring_students: 60,
      storage_gb: 30,
      monthly_traffic_gb: 200,
      videos: 40,
      dedicated_templates: 1
    }
  },
  growth: {
    price_monthly_toman: 6_500_000,
    price_quarterly_toman: 18_500_000,
    limits: {
      managers: 2,
      teachers: 5,
      courses: 15,
      seasons_per_course: 20,
      lessons_per_course: 200,
      tutoring_students: 180,
      storage_gb: 100,
      monthly_traffic_gb: 700,
      videos: 250,
      dedicated_templates: 3
    }
  },
  business: {
    price_monthly_toman: 11_000_000,
    price_quarterly_toman: 31_000_000,
    limits: {
      managers: 5,
      teachers: 15,
      courses: 50,
      seasons_per_course: 50,
      lessons_per_course: 500,
      tutoring_students: 450,
      storage_gb: 250,
      monthly_traffic_gb: 1500,
      videos: 1000,
      dedicated_templates: 10
    }
  }
};

export const planDefaults = (slug: string): PlanDefaults | undefined =>
  PLAN_DEFAULTS[slug.toLowerCase().trim()];

/** Measured provider unit costs — placeholders for the cost-assumption inputs. */
export const COST_DEFAULTS = {
  cost_storage_per_gb_toman: 3_000,
  cost_egress_per_gb_toman: 1_200,
  cost_app_egress_per_gb_toman: 3_200,
  cost_compute_base_per_academy_toman: 100_000,
  cost_compute_per_student_toman: 300,
  cost_sms_per_message_toman: 300,
  cost_gateway_fee_rate: 0.01,
  cost_platform_fixed_monthly_toman: 8_220_000,
  storage_addon_gb: 50,
  storage_addon_price_toman: 700_000,
  traffic_addon_gb: 200,
  traffic_addon_price_toman: 900_000
} as const;

export type CostSettingKey = keyof typeof COST_DEFAULTS;

/**
 * Revenue used for the margin preview. The plan row is authoritative, so the
 * price in the form is what the margin must clear — no catalog override.
 */
export function planRevenueForMargin(
  _slug: string,
  formMonthlyToman: number
): number {
  return formMonthlyToman;
}
