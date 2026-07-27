'use client';

import { useCallback } from 'react';
import { useTranslation } from './hooks';
import { getLocaleForLanguage } from './config';

/**
 * Digits must follow the UI language (۱۲۳ in Persian), so every count, price and
 * page number goes through one formatter instead of a hardcoded 'fa-IR'.
 */
export function useNumberFormat() {
  const { language } = useTranslation();
  const locale = getLocaleForLanguage(language);

  return useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      value.toLocaleString(locale, options),
    [locale]
  );
}
