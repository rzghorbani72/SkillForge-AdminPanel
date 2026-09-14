import type { CoursePayment } from './types';

export type RangeOption = { labelKey: string; days: number };

export const RANGE_OPTIONS: RangeOption[] = [
  { labelKey: 'courseDetail.last7', days: 7 },
  { labelKey: 'courseDetail.last30', days: 30 },
  { labelKey: 'courseDetail.last90', days: 90 },
  { labelKey: 'courseDetail.last6m', days: 180 },
  { labelKey: 'courseDetail.last12m', days: 365 },
];

export type RevenuePoint = { date: string; revenue: number; label: string };

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function paidOn(payment: CoursePayment): string | null {
  const raw = payment.paid_at ?? payment.payment_date ?? payment.created_at;
  return raw ? raw.slice(0, 10) : null;
}

export function sumAmount(payments: CoursePayment[]): number {
  return payments.reduce((total, p) => total + (p.amount ?? 0), 0);
}

export function paymentsInLastDays(payments: CoursePayment[], days: number): CoursePayment[] {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startISO = toISODate(start);
  return payments.filter((p) => {
    const day = paidOn(p);
    return day !== null && day >= startISO;
  });
}

export function buildRevenueSeries(
  payments: CoursePayment[],
  days: number,
  locale: string,
): RevenuePoint[] {
  const buckets = new Map<string, number>();
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - days);
  for (let i = 0; i <= days; i++) {
    buckets.set(toISODate(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }
  for (const payment of payments) {
    const day = paidOn(payment);
    if (day === null) continue;
    const current = buckets.get(day);
    if (current !== undefined) {
      buckets.set(day, current + (payment.amount ?? 0));
    }
  }
  return Array.from(buckets, ([date, revenue]) => ({
    date,
    revenue,
    label: new Date(date).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    }),
  }));
}

export function firstSaleDate(payments: CoursePayment[]): string | null {
  const days = payments
    .map(paidOn)
    .filter((d): d is string => d !== null)
    .sort();
  return days[0] ?? null;
}
