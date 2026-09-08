import type { StructuredPlanLimits } from '@/lib/api';

export const PLAN_LIMIT_KEYS: (keyof StructuredPlanLimits)[] = [
  'managers',
  'teachers',
  'courses',
  'seasons_per_course',
  'lessons_per_course',
  'tutoring_students',
  'storage_gb',
  'videos',
  'dedicated_templates'
];

export const DEFAULT_LIMITS: StructuredPlanLimits = {
  managers: 1,
  teachers: 1,
  courses: 1,
  seasons_per_course: 5,
  lessons_per_course: 50,
  tutoring_students: 125,
  storage_gb: 5,
  videos: 10,
  dedicated_templates: 1
};

export const irrToToman = (irr: number) => Math.round(irr / 10);
export const tomanToIrr = (toman: number) => Math.round(toman * 10);

export const formatToman = (toman: number) =>
  toman.toLocaleString('fa-IR') + ' تومان';

export const formatIRR = (v: number) => v.toLocaleString('fa-IR') + ' ریال';

export const toPercent = (rate: number) => +(rate * 100).toFixed(4);
export const fromPercent = (pct: number) => +(pct / 100).toFixed(6);

const CATALOG_MONTHLY_TOMAN: Record<string, number> = {
  starter: 2_800_000,
  growth: 5_800_000,
  business: 9_000_000
};

/** Revenue used for margin math — catalog slugs use fixed shop prices. */
export function planRevenueForMargin(
  slug: string,
  formMonthlyToman: number
): number {
  const catalog = CATALOG_MONTHLY_TOMAN[slug.toLowerCase()];
  if (catalog) return catalog;
  return formMonthlyToman;
}
