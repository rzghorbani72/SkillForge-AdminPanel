export type PricingType = 'ONE_TIME' | 'SUBSCRIPTION' | 'FREE' | 'PAYMENT_PLAN';
export type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
export type Lesson = { id: string; title: string; duration: string };
export type Section = { id: string; title: string; lessons: Lesson[] };

export const PRICING_OPTION_KEYS: {
  type: PricingType;
  labelKey: string;
  subKey: string;
}[] = [
  {
    type: 'ONE_TIME',
    labelKey: 'courses.paidType',
    subKey: 'courses.oneTimePayment'
  },
  {
    type: 'SUBSCRIPTION',
    labelKey: 'courses.subscriptionPlan',
    subKey: 'courses.monthlyYearly'
  },
  { type: 'FREE', labelKey: 'courses.free', subKey: 'courses.noPayment' },
  {
    type: 'PAYMENT_PLAN',
    labelKey: 'courses.installmentPlan',
    subKey: 'courses.installments3to6'
  }
];

export const LEVEL_KEYS = [
  { value: 'BEGINNER', labelKey: 'courses.beginner' },
  { value: 'INTERMEDIATE', labelKey: 'courses.intermediate' },
  { value: 'ADVANCED', labelKey: 'courses.advanced' }
];

export const STEP_KEYS = [
  { n: 1, labelKey: 'courses.stepDetails' },
  { n: 2, labelKey: 'courses.content' },
  { n: 3, labelKey: 'courses.price' },
  { n: 4, labelKey: 'courses.stepPublish' }
];

export function uid() {
  return Math.random().toString(36).slice(2);
}

export function extractList(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const r = raw as Record<string, unknown>;
  for (const key of ['categories', 'profiles', 'users', 'data', 'items']) {
    if (Array.isArray(r[key])) return r[key] as unknown[];
  }
  return [];
}
