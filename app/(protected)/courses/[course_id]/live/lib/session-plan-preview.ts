import type { TutoringGroupSlot } from '@/types/learning-operations';

const MINUTE_MS = 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * MINUTE_MS;

/** Wall-clock parts of an instant as a given timezone sees them. */
const partsIn = (at: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(at);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    get('weekday')
  );
  return {
    weekday: weekday < 0 ? at.getUTCDay() : weekday,
    minutes: Number(get('hour')) * 60 + Number(get('minute'))
  };
};

/**
 * The first instant matching "this weekday at this local time", at or after
 * `from`. Walks from the current local time rather than converting offsets, so
 * it needs no timezone database in the browser.
 */
const nextWeekdayTime = (
  timeZone: string,
  weekday: number,
  startMinute: number,
  from: Date
): Date => {
  const here = partsIn(from, timeZone);
  const daysAhead = (weekday - here.weekday + 7) % 7;
  let at = new Date(
    from.getTime() +
      daysAhead * 24 * 60 * MINUTE_MS +
      (startMinute - here.minutes) * MINUTE_MS
  );
  if (at.getTime() < from.getTime()) at = new Date(at.getTime() + WEEK_MS);
  return at;
};

/**
 * The dates a timetable will produce — a browser mirror of the backend planner
 * (`Backend/src/tutoring-groups/session-plan.ts`). A teacher who sees different
 * dates here than the ones finally written would never trust the product, so
 * this must stay a faithful copy: meetings are emitted in chronological order
 * across the slots and stop at the count, never rounding up to a whole week.
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
