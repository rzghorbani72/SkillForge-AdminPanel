import { toPersianDigits } from '@/lib/format-identifier';

const ISO_DATE = /\d{4}-\d{2}-\d{2}/g;

/** Stored copy often bakes in Gregorian `YYYY-MM-DD`; show Jalali + Persian digits in fa. */
export function localizeNotificationText(
  text: string,
  language: string,
  formatDate: (value: string | Date) => string,
): string {
  const withDates = text.replace(ISO_DATE, (iso) => formatDate(`${iso}T12:00:00`));
  return language === 'fa' ? toPersianDigits(withDates) : withDates;
}
