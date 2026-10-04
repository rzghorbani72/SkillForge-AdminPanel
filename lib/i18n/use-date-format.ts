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
    (value: string | Date, options?: Intl.DateTimeFormatOptions) => {
      const date = new Date(value);
      const format = (extra?: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          // 24-hour whenever the caller asks for a time.
          hourCycle: 'h23',
          ...(language === 'fa' ? { calendar: 'persian' as const } : {}),
          ...extra,
        }).format(date);
      // fa-IR flips to "year month day, weekday" once a weekday is asked for.
      if (language !== 'fa' || !options?.weekday) return format(options);
      const { weekday, ...rest } = options;
      return `${new Intl.DateTimeFormat(locale, { weekday }).format(date)}، ${format(rest)}`;
    },
    [locale, language],
  );
}
