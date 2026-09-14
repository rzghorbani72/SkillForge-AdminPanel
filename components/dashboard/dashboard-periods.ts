/**
 * The dashboard's time window. Flow metrics (money in, enrolments, courses
 * created) are measured inside it and charted bucket by bucket; stock counters
 * such as "total students" stay all-time, because a total has no window.
 */
export type DashboardPeriod = '7d' | '30d' | '3m' | '1y';

export type PeriodOption = {
  key: DashboardPeriod;
  labelKey: string;
};

export const PERIOD_OPTIONS: readonly PeriodOption[] = [
  { key: '7d', labelKey: 'dashboard.period7Days' },
  { key: '30d', labelKey: 'dashboard.period30Days' },
  { key: '3m', labelKey: 'dashboard.period3Months' },
  { key: '1y', labelKey: 'dashboard.periodYear' },
] as const;

export type BucketGrain = 'day' | 'week' | 'month';

export type PeriodWindow = {
  start: Date;
  end: Date;
  /** The equally long window immediately before this one: the delta baseline. */
  previousStart: Date;
  /** Bucket start dates, oldest first — the x axis of every trend. */
  buckets: Date[];
  grain: BucketGrain;
};

const DAY_MS = 86_400_000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayBuckets = (count: number, now: Date, stepDays = 1): Date[] => {
  const today = startOfDay(now).getTime();
  return Array.from(
    { length: count },
    (_, i) => new Date(today - (count - 1 - i) * stepDays * DAY_MS),
  );
};

const monthBuckets = (count: number, now: Date): Date[] =>
  Array.from(
    { length: count },
    (_, i) => new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1),
  );

const GRAINS: Record<DashboardPeriod, { grain: BucketGrain; buckets: (now: Date) => Date[] }> = {
  '7d': { grain: 'day', buckets: (now) => dayBuckets(7, now) },
  '30d': { grain: 'day', buckets: (now) => dayBuckets(30, now) },
  '3m': { grain: 'week', buckets: (now) => dayBuckets(13, now, 7) },
  '1y': { grain: 'month', buckets: (now) => monthBuckets(12, now) },
};

export const periodWindow = (period: DashboardPeriod, now = new Date()): PeriodWindow => {
  const { grain, buckets: build } = GRAINS[period];
  const buckets = build(now);
  const start = buckets[0];
  // The window closes after "now", not at the last bucket's edge, so activity
  // from earlier today is counted instead of being dropped.
  const end = new Date(now.getTime() + 1);
  const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));

  return { start, end, previousStart, buckets, grain };
};
