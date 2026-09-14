import { getLocaleForLanguage, type LanguageCode } from './config';

export interface CalendarDayCell {
  date: Date;
  day: number;
  inMonth: boolean;
}

function calendarFor(language: LanguageCode): string {
  return language === 'fa' ? 'persian' : 'gregory';
}

function partsOf(date: Date, calendar: string) {
  const parts = new Intl.DateTimeFormat(`en-US-u-ca-${calendar}`, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  const read = (type: 'year' | 'month' | 'day') =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  return { year: read('year'), month: read('month'), day: read('day') };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(date: Date, calendar: string): Date {
  const day = partsOf(date, calendar).day;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - (day - 1));
  start.setHours(12, 0, 0, 0);
  return start;
}

/** Gregorian YYYY-MM-DD for form values and API payloads. */
export function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromInputValue(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Local `YYYY-MM-DDTHH:mm`, the shape a datetime form field carries. */
export function toDateTimeInputValue(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${toInputValue(date)}T${hh}:${mm}`;
}

export function fromDateTimeInputValue(value: string): Date | undefined {
  if (!value) return undefined;
  const [datePart, timePart] = value.split('T');
  const date = fromInputValue(datePart);
  if (!date) return undefined;
  const [hours, minutes] = (timePart ?? '00:00').split(':').map(Number);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

export function calendarParts(date: Date, language: LanguageCode) {
  return partsOf(date, calendarFor(language));
}

export function findCalendarDate(
  year: number,
  month: number,
  day: number,
  language: LanguageCode,
): Date {
  const calendar = calendarFor(language);
  let probe = startOfMonth(new Date(), calendar);
  probe.setHours(12, 0, 0, 0);

  for (let guard = 0; guard < 50_000; guard++) {
    const current = partsOf(probe, calendar);
    if (current.year === year && current.month === month && current.day === day) {
      return probe;
    }
    const cmp =
      current.year !== year
        ? current.year - year
        : current.month !== month
          ? current.month - month
          : current.day - day;
    probe = addDays(probe, cmp > 0 ? -1 : 1);
  }

  return probe;
}

export function shiftCalendarMonth(
  year: number,
  month: number,
  delta: number,
  _language: LanguageCode,
): { year: number; month: number } {
  let nextMonth = month + delta;
  let nextYear = year;

  while (nextMonth > 12) {
    nextMonth -= 12;
    nextYear += 1;
  }
  while (nextMonth < 1) {
    nextMonth += 12;
    nextYear -= 1;
  }

  return { year: nextYear, month: nextMonth };
}

export function buildMonthsForYear(
  year: number,
  language: LanguageCode,
): Array<{ month: number; shortLabel: string }> {
  const locale = getLocaleForLanguage(language);
  const calendar = calendarFor(language);
  const shortName = new Intl.DateTimeFormat(locale, {
    month: 'short',
    calendar,
  });

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const date = findCalendarDate(year, month, 15, language);
    return { month, shortLabel: shortName.format(date) };
  });
}

export function buildMonthGrid(
  year: number,
  month: number,
  language: LanguageCode,
): CalendarDayCell[] {
  const calendar = calendarFor(language);
  const monthStart = startOfMonth(findCalendarDate(year, month, 1, language), calendar);
  const nextMonthStart = startOfMonth(addDays(monthStart, 35), calendar);
  const daysInMonth = partsOf(addDays(nextMonthStart, -1), calendar).day;
  const weekStart = language === 'fa' ? 6 : 0;
  const offset = (monthStart.getDay() - weekStart + 7) % 7;
  const cells: CalendarDayCell[] = [];

  for (let i = offset; i > 0; i--) {
    const date = addDays(monthStart, -i);
    cells.push({ date, day: partsOf(date, calendar).day, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = addDays(monthStart, day - 1);
    cells.push({ date, day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const date = addDays(cells[cells.length - 1].date, 1);
    cells.push({ date, day: partsOf(date, calendar).day, inMonth: false });
  }

  return cells;
}

export function formatMonthYear(year: number, month: number, language: LanguageCode): string {
  const locale = getLocaleForLanguage(language);
  const calendar = calendarFor(language);
  const date = findCalendarDate(year, month, 1, language);
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    calendar,
  }).format(date);
}

export function weekdayLabels(language: LanguageCode): string[] {
  const locale = getLocaleForLanguage(language);
  const calendar = calendarFor(language);
  const fmt = new Intl.DateTimeFormat(locale, {
    weekday: 'narrow',
    calendar,
  });
  const anchor = language === 'fa' ? new Date(2024, 0, 6, 12) : new Date(2024, 0, 7, 12);

  return Array.from({ length: 7 }, (_, index) => fmt.format(addDays(anchor, index)));
}

export function isSameInputDay(a: Date, b: Date): boolean {
  return toInputValue(a) === toInputValue(b);
}

export function todayInputValue(): string {
  return toInputValue(new Date());
}

export function addInputDays(value: string, days: number): string | undefined {
  const date = fromInputValue(value);
  if (!date) return undefined;
  return toInputValue(addDays(date, days));
}

export function isInputDayBefore(a: string, b: string): boolean {
  return a < b;
}

export function isDayDisabled(date: Date, minDate?: string, maxDate?: string): boolean {
  const value = toInputValue(date);
  if (minDate && value < minDate) return true;
  if (maxDate && value > maxDate) return true;
  return false;
}
