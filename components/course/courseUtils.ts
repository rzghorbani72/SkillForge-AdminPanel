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

export function courseHue(id: string | number) {
  const n =
    typeof id === 'number'
      ? id
      : id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (CATEGORY_COLORS[n % 8] ?? CATEGORY_COLORS[0]).h;
}

export function formatNumber(n: number, lang = 'fa-IR') {
  return n.toLocaleString(lang);
}

/**
 * Course length in whole minutes → "۲ ساعت", "۴۵ دقیقه", or "۱ ساعت ۳۰ دقیقه".
 * Omits a trailing zero-minute part so badges never show "۲ ساعت ۰ دقیقه".
 */
export function formatCourseDurationMinutes(
  minutes: number | null | undefined,
  formatNum: (n: number) => string,
  t: (key: string) => string
): string | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;
  const total = Math.round(minutes);
  if (total < 60) {
    return `${formatNum(total)} ${t('courses.minutesShort')}`;
  }
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const hoursLabel = `${formatNum(hours)} ${t('courses.hoursShort')}`;
  if (rest === 0) return hoursLabel;
  return `${hoursLabel} ${formatNum(rest)} ${t('courses.minutesShort')}`;
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

/**
 * What a live course actually charges: the price of one seat in the class. It
 * lives on the course's GROUP tutoring offer, never on the course itself.
 */
export function groupSeatPrice(course: {
  TutoringOffer?: { kind: 'GROUP' | 'SOLO'; price: number }[];
}): number | null {
  const seat = course.TutoringOffer?.find((offer) => offer.kind === 'GROUP');
  return seat ? seat.price : null;
}
