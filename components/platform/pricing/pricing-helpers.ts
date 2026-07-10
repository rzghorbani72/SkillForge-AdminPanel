import type { StructuredPlanLimits } from '@/lib/api';

export const PLAN_LIMIT_KEYS: (keyof StructuredPlanLimits)[] = [
  'managers',
  'teachers',
  'courses',
  'seasons_per_course',
  'lessons_per_course',
  'active_students',
  'storage_gb',
  'live_classes_per_month',
  'videos'
];

export const DEFAULT_LIMITS: StructuredPlanLimits = {
  managers: 1,
  teachers: 1,
  courses: 1,
  seasons_per_course: 5,
  lessons_per_course: 50,
  active_students: 100,
  storage_gb: 5,
  live_classes_per_month: 8,
  videos: 10
};

export const irrToToman = (irr: number) => Math.round(irr / 10);
export const tomanToIrr = (toman: number) => Math.round(toman * 10);

export const formatToman = (toman: number) =>
  toman.toLocaleString('fa-IR') + ' تومان';

export const formatIRR = (v: number) => v.toLocaleString('fa-IR') + ' ریال';

export const toPercent = (rate: number) => +(rate * 100).toFixed(4);
export const fromPercent = (pct: number) => +(pct / 100).toFixed(6);
