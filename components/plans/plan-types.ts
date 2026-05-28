import { SubscriptionPlanData } from '@/lib/api';

export type { SubscriptionPlanData };

export interface AcademySubscription {
  id: number;
  plan_name: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  storage_used_gb?: number;
  students_count?: number;
}

export interface AcademyPlanData {
  id: number;
  academy_id: number;
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

export function formatPrice(price: number) {
  return price.toLocaleString('fa-IR');
}

export function formatStorage(gb: number) {
  return gb >= 1000 ? `${(gb / 1000).toFixed(0)} TB` : `${gb} GB`;
}
