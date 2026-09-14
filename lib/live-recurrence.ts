/**
 * Weekly repeat for a live class, in the one shape the backend accepts:
 * `FREQ=WEEKLY` (repeat on the start weekday) or `FREQ=WEEKLY;BYDAY=SA,MO`.
 * Weekday indexes are JS `Date.getDay()` values, so 0 = Sunday.
 */

export const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export type WeekdayCode = (typeof WEEKDAY_CODES)[number];

/** Display order for a Persian week: Saturday first, Friday last. */
export const WEEK_ORDER: readonly number[] = [6, 0, 1, 2, 3, 4, 5];

export const WEEKDAY_LABEL_KEYS: Record<number, string> = {
  0: 'weekdays.sunday',
  1: 'weekdays.monday',
  2: 'weekdays.tuesday',
  3: 'weekdays.wednesday',
  4: 'weekdays.thursday',
  5: 'weekdays.friday',
  6: 'weekdays.saturday',
};

const RULE_PATTERN = /^FREQ=WEEKLY(;BYDAY=(SU|MO|TU|WE|TH|FR|SA)(,(SU|MO|TU|WE|TH|FR|SA))*)?$/i;

/** The weekdays a stored rule repeats on; empty array means "no repeat". */
export const parseWeeklyRule = (rule?: string | null): number[] => {
  if (!rule || !RULE_PATTERN.test(rule)) return [];
  const byDay = /BYDAY=([A-Z,]+)/i.exec(rule);
  if (!byDay) return [];
  return byDay[1]
    .toUpperCase()
    .split(',')
    .map((code) => WEEKDAY_CODES.indexOf(code as WeekdayCode))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);
};

/** Null when the class does not repeat, so the caller can store it as-is. */
export const buildWeeklyRule = (days: readonly number[]): string | null => {
  if (days.length === 0) return null;
  const codes = [...days]
    .sort((a, b) => a - b)
    .map((index) => WEEKDAY_CODES[index])
    .filter((code): code is WeekdayCode => Boolean(code));
  return codes.length ? `FREQ=WEEKLY;BYDAY=${codes.join(',')}` : null;
};
