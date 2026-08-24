import type { TutoringGroupSlot } from '@/types/learning-operations';

const MINUTE_MS = 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * MINUTE_MS;

/**
 * How far the zone is from UTC at a given instant, in milliseconds. Reading the
 * zone's own clock and treating it as UTC gives the offset without shipping a
 * timezone database to the browser.
 */
const offsetAt = (at: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(at);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second')
  );
  return asUtc - at.getTime();
};

/** The zone's calendar date and weekday at a given instant. */
const localDateOf = (at: Date, timeZone: string) => {
  const local = new Date(at.getTime() + offsetAt(at, timeZone));
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    day: local.getUTCDate(),
    weekday: local.getUTCDay(),
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes()
  };
};

/**
 * The instant at which the zone's clock reads this calendar day and minute.
 * Resolved twice because the offset at the first guess can differ from the
 * offset at the answer — which is exactly what happens on a clock-change day.
 */
const instantOf = (
  year: number,
  month: number,
  day: number,
  minutes: number,
  timeZone: string
): Date => {
  const wallClock = Date.UTC(year, month - 1, day) + minutes * MINUTE_MS;
  const firstGuess = wallClock - offsetAt(new Date(wallClock), timeZone);
  return new Date(wallClock - offsetAt(new Date(firstGuess), timeZone));
};

/**
 * The first instant matching "this weekday at this local time", at or after
 * `from`. Mirrors `nextWeekdayTimeInZone` in the backend, which resolves the
 * same thing through moment-timezone.
 */
const nextWeekdayTime = (
  timeZone: string,
  weekday: number,
  startMinute: number,
  from: Date
): Date => {
  const here = localDateOf(from, timeZone);
  const daysAhead = (weekday - here.weekday + 7) % 7;
  const at = instantOf(
    here.year,
    here.month,
    here.day + daysAhead,
    startMinute,
    timeZone
  );
  if (at.getTime() >= from.getTime()) return at;
  return instantOf(
    here.year,
    here.month,
    here.day + daysAhead + 7,
    startMinute,
    timeZone
  );
};

/**
 * The dates a timetable will produce — a browser mirror of the backend planner
 * (`Backend/src/tutoring-groups/session-plan.ts`). A teacher who sees different
 * dates here than the ones finally written would never trust the product, so
 * this must stay a faithful copy: meetings are emitted in chronological order
 * across the slots and stop at the count, never rounding up to a whole week.
 *
 * The two are held together by `Backend/src/__parity__/planner-parity.spec.ts`
 * — change one and update the other, or that test fails.
 */
export const previewSessionDates = (
  slots: TutoringGroupSlot[],
  sessionCount: number,
  startsOn: Date,
  timeZone: string
): Date[] => {
  if (!slots.length || sessionCount < 1) return [];

  const pending = slots.map((slot) => ({
    at: nextWeekdayTime(
      timeZone,
      slot.weekday,
      slot.start_minute,
      startsOn
    ).getTime()
  }));

  const planned: number[] = [];
  while (planned.length < sessionCount) {
    const next = pending.reduce((a, b) => (a.at <= b.at ? a : b));
    planned.push(next.at);
    next.at += WEEK_MS;
  }
  return planned.sort((a, b) => a - b).map((at) => new Date(at));
};
