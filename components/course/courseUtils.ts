export const CATEGORY_COLORS: Record<number, { h: number }> = {
  0: { h: 22 },
  1: { h: 240 },
  2: { h: 165 },
  3: { h: 75 },
  4: { h: 320 },
  5: { h: 200 },
  6: { h: 280 },
  7: { h: 50 }
};

export function courseHue(id: number) {
  return CATEGORY_COLORS[id % 8].h;
}

export function formatNumber(n: number, lang = 'fa-IR') {
  return n.toLocaleString(lang);
}

export function pricingTypeLabel(
  type: string,
  t: (key: string) => string
): string {
  if (type === 'FREE') return t('courses.free');
  if (type === 'ONE_TIME') return t('courses.oneTimePayment');
  if (type === 'SUBSCRIPTION') return t('courses.subscriptionPlan');
  return t('courses.installmentPlan');
}
