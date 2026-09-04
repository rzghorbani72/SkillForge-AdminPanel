import { Enrollment, Payment } from '@/types/api';

/** A settled payment. The API's PaymentStatus enum spells this `PAID`. */
const isPaid = (status?: string | null) => status === 'PAID';

const paidAtOf = (p: Payment) =>
  p.paid_at ?? p.payment_date ?? p.created_at ?? null;

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
    value: total === 0 ? 0 : Math.round((counts[key] / total) * 100)
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
export const journeySteps = (
  enrollments: Enrollment[],
  totalStudents: number
): JourneyStep[] => {
  const enrolledStudents = new Set(
    enrollments.map((e) => e.user_id).filter(Boolean)
  ).size;
  const active = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;

  return [
    { key: 'students', value: Math.max(totalStudents, enrolledStudents) },
    { key: 'enrolled', value: enrolledStudents },
    { key: 'active', value: active },
    { key: 'completed', value: completed }
  ];
};

/** Month-over-month change as a whole percentage; null when there is no base. */
export const monthOverMonth = (series: number[]): number | null => {
  if (series.length < 2) return null;
  const previous = series[series.length - 2];
  const current = series[series.length - 1];
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
};

export const monthlyRevenue = (payments: Payment[], months: Date[]): number[] =>
  months.map((start, i) => {
    const end = months[i + 1] ?? new Date(8640000000000000);
    return payments
      .filter((p) => {
        const raw = paidAtOf(p);
        if (!isPaid(p.status) || !raw) return false;
        const date = new Date(raw);
        return date >= start && date < end;
      })
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  });

export const monthlyCount = (
  dates: (string | null | undefined)[],
  months: Date[]
): number[] =>
  months.map((start, i) => {
    const end = months[i + 1] ?? new Date(8640000000000000);
    return dates.filter((raw) => {
      if (!raw) return false;
      const date = new Date(raw);
      return date >= start && date < end;
    }).length;
  });

/** First day of each of the last `count` months, oldest first. */
export const lastMonths = (count: number, now = new Date()): Date[] =>
  Array.from(
    { length: count },
    (_, i) => new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1)
  );
