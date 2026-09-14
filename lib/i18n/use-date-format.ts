'use client';

import { useCallback } from 'react';
import { useTranslation } from './hooks';
import { getLocaleForLanguage } from './config';

/**
 * Dates must follow the UI language (۶ مرداد ۱۴۰۵ in Persian), so screens format
 * through one locale-aware formatter instead of date-fns patterns, which always
 * render English month names.
 */
export function useDateFormat() {
  const { language } = useTranslation();
  const locale = getLocaleForLanguage(language);

  return useCallback(
    (value: string | Date, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        // 24-hour whenever the caller asks for a time.
        hourCycle: 'h23',
        ...(language === 'fa' ? { calendar: 'persian' as const } : {}),
        ...options,
      }).format(new Date(value)),
    [locale, language],
  );
}
