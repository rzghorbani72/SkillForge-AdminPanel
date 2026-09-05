'use client';

import { useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleForLanguage } from '@/lib/i18n/config';

/**
 * Metric buckets arrive as Gregorian `YYYY-MM` (or `YYYY-MM-DD`) keys. A reader
 * of the Persian UI expects a Jalali label, so the key is labelled by the
 * calendar month its midpoint falls in.
 */
export function usePeriodLabel() {
  const { language } = useTranslation();
  const locale = getLocaleForLanguage(language);

  return useCallback(
    (value: string): string => {
      const [year, month, day] = value.split('-').map(Number);
      if (!year || !month) return value;

      const date = new Date(Date.UTC(year, month - 1, day ?? 15, 12));
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        timeZone: 'UTC',
        ...(day ? { day: 'numeric' } : { year: 'numeric' }),
        ...(language === 'fa' ? { calendar: 'persian' as const } : {})
      }).format(date);
    },
    [locale, language]
  );
}

/** Figures on this page are the point of it — keep them large and readable. */
export const METRIC_VALUE_CLASS = 'text-base font-semibold';
