import { getLocaleForLanguage, type LanguageCode } from './config';

/**
 * Periods must follow the calendar the UI shows: a Persian manager picking
 * "مرداد" has to get the Jalali month, not a Gregorian one relabelled. Month
 * boundaries are found by reading the day-of-month in the target calendar and
 * stepping back to its first day, so no calendar math is hand-written.
 */

export interface CalendarMonth {
  year: number;
  month: number;
  label: string;
  shortLabel: string;
  startIso: string;
  endIso: string;
}

const YEARS_BACK = 4;

function calendarFor(language: LanguageCode): string {
  return language === 'fa' ? 'persian' : 'gregory';
}

function partsOf(date: Date, calendar: string) {
  const parts = new Intl.DateTimeFormat(`en-US-u-ca-${calendar}`, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(date);

  const read = (type: 'year' | 'month' | 'day') =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  return { year: read('year'), month: read('month'), day: read('day') };
}

function startOfMonth(date: Date, calendar: string): Date {
  const day = partsOf(date, calendar).day;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - (day - 1));
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Every month from the current one back to `YEARS_BACK` years ago, newest first. */
export function buildCalendarMonths(language: LanguageCode): CalendarMonth[] {
  const calendar = calendarFor(language);
  const locale = getLocaleForLanguage(language);
  const longName = new Intl.DateTimeFormat(locale, {
    month: 'long',
    calendar
  });
  const shortName = new Intl.DateTimeFormat(locale, {
    month: 'short',
    calendar
  });

  const oldestYear = partsOf(new Date(), calendar).year - YEARS_BACK;
  const months: CalendarMonth[] = [];
  let start = startOfMonth(new Date(), calendar);

  while (true) {
    const { year, month } = partsOf(start, calendar);
    if (year < oldestYear) break;

    const nextStart = startOfMonth(addDays(start, 32), calendar);
    const end = new Date(nextStart.getTime() - 1);

    months.push({
      year,
      month,
      label: longName.format(start),
      shortLabel: shortName.format(start),
      startIso: start.toISOString(),
      endIso: end.toISOString()
    });

    start = startOfMonth(addDays(start, -1), calendar);
  }

  return months;
}

export function yearsOf(months: CalendarMonth[]): number[] {
  return Array.from(new Set(months.map((month) => month.year)));
}

/** Range of one month, or of a whole year when `month` is null. */
export function rangeFor(
  months: CalendarMonth[],
  year: number,
  month: number | null
): { startIso: string; endIso: string } {
  const inYear = months.filter((entry) => entry.year === year);
  const fallback = months[0];

  if (month !== null) {
    const match = inYear.find((entry) => entry.month === month);
    if (match) return { startIso: match.startIso, endIso: match.endIso };
  }

  const newest = inYear[0] ?? fallback;
  const oldest = inYear[inYear.length - 1] ?? fallback;
  return { startIso: oldest.startIso, endIso: newest.endIso };
}
