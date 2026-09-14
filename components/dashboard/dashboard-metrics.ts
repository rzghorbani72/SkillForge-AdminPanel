import { Enrollment, Payment } from '@/types/api';

/** A settled payment. The API's PaymentStatus enum spells this `PAID`. */
const isPaid = (status?: string | null) => status === 'PAID';

const paidAtOf = (p: Payment) => p.paid_at ?? p.payment_date ?? p.created_at ?? null;

export type WeekdayPoint = { index: number; enrollments: number };

export type StatusSegment = {
  key: 'completed' | 'inProgress' | 'notStarted' | 'ended';
  value: number;
};

export type JourneyStep = {
  key: 'students' | 'enrolled' | 'active' | 'completed';
  value: number;
};

/**
 * Enrolments per weekday, index 0 = Saturday so the bars read in the order a
 * MENA week is taught. `getDay()` is Sunday-first, hence the +1 rotation.
 */
export const bucketByWeekday = (enrollments: Enrollment[]): WeekdayPoint[] => {
  const buckets = new Array(7).fill(0) as number[];

  for (const enrollment of enrollments) {
    if (!enrollment.enrolled_at) continue;
    const date = new Date(enrollment.enrolled_at);
    if (Number.isNaN(date.getTime())) continue;
    buckets[(date.getDay() + 1) % 7] += 1;
  }

  return buckets.map((enrollments, index) => ({ index, enrollments }));
};

/** Learning status of every enrolment, as whole percentages that sum to 100. */
export const statusSegments = (enrollments: Enrollment[]): StatusSegment[] => {
  const counts = { completed: 0, inProgress: 0, notStarted: 0, ended: 0 };

  for (const enrollment of enrollments) {
    if (enrollment.status === 'COMPLETED') counts.completed += 1;
    else if (enrollment.status === 'ACTIVE')
      if ((enrollment.progress_percent ?? 0) > 0) counts.inProgress += 1;
      else counts.notStarted += 1;
    else counts.ended += 1;
  }

  const total = enrollments.length;
  const keys = ['completed', 'inProgress', 'notStarted', 'ended'] as const;

  return keys.map((key) => ({
    key,
    value: total === 0 ? 0 : Math.round((counts[key] / total) * 100),
  }));
};

/** Share of enrolments that reached COMPLETED, as a whole percentage. */
export const completionRate = (enrollments: Enrollment[]): number => {
  if (enrollments.length === 0) return 0;
  const done = enrollments.filter((e) => e.status === 'COMPLETED').length;
  return Math.round((done / enrollments.length) * 100);
};

/**
 * The real student journey: everyone the academy knows, who enrolled, who is
 * still learning, who finished. Each step is a subset of the one above it.
 */
export const journeySteps = (enrollments: Enrollment[], totalStudents: number): JourneyStep[] => {
  const enrolledStudents = new Set(enrollments.map((e) => e.user_id).filter(Boolean)).size;
  const active = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;

  return [
    { key: 'students', value: Math.max(totalStudents, enrolledStudents) },
    { key: 'enrolled', value: enrolledStudents },
    { key: 'active', value: active },
    { key: 'completed', value: completed },
  ];
};

/** Change against the previous window as a whole percentage; null with no base. */
export const percentChange = (current: number, previous: number): number | null =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 100);

const inRange = (raw: string | null | undefined, from: Date, to: Date) => {
  if (!raw) return false;
  const date = new Date(raw);
  return date >= from && date < to;
};

/** Settled revenue between two instants — a card value or its delta baseline. */
export const revenueBetween = (payments: Payment[], from: Date, to: Date): number =>
  payments
    .filter((p) => isPaid(p.status) && inRange(paidAtOf(p), from, to))
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

export const enrollmentsBetween = (enrollments: Enrollment[], from: Date, to: Date): Enrollment[] =>
  enrollments.filter((e) => inRange(e.enrolled_at, from, to));

export const countBetween = (dates: (string | null | undefined)[], from: Date, to: Date): number =>
  dates.filter((raw) => inRange(raw, from, to)).length;

/** Revenue per bucket; `end` closes the last, still-open bucket. */
export const bucketRevenue = (payments: Payment[], buckets: Date[], end: Date): number[] =>
  buckets.map((from, i) => revenueBetween(payments, from, buckets[i + 1] ?? end));

export const bucketCount = (
  dates: (string | null | undefined)[],
  buckets: Date[],
  end: Date,
): number[] =>
  buckets.map((from, i) => {
    const to = buckets[i + 1] ?? end;
    return dates.filter((raw) => inRange(raw, from, to)).length;
  });
