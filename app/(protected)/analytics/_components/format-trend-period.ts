import { formatMonthYear } from '@/lib/i18n/format-month-year';
import type { LanguageCode } from '@/lib/i18n/config';

export function formatTrendPeriod(period: string, language: LanguageCode): string {
  const [yearPart, monthPart] = period.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return period;
  return formatMonthYear(new Date(year, month - 1, 1), language);
}
