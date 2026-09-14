import { getLocaleForLanguage, type LanguageCode } from './config';

/** Short month + year label for charts (Jalali when language is fa). */
export function formatMonthYear(date: Date, language: LanguageCode): string {
  return new Intl.DateTimeFormat(getLocaleForLanguage(language), {
    month: 'short',
    year: '2-digit',
    ...(language === 'fa' ? { calendar: 'persian' as const } : {}),
  }).format(date);
}
