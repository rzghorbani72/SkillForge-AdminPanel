'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { DEFAULT_LANGUAGE } from '@/lib/i18n/config';

/** Language switching is off for now: reset any old saved choice back to the default. */
export function LanguageSync() {
  const { setLanguage } = useI18n();

  useEffect(() => {
    const stored = localStorage.getItem('preferred_language');
    const hasOtherCookie =
      document.cookie.includes('preferred_language=') &&
      !document.cookie.includes(`preferred_language=${DEFAULT_LANGUAGE}`);
    if ((stored && stored !== DEFAULT_LANGUAGE) || hasOtherCookie) {
      setLanguage(DEFAULT_LANGUAGE);
    }
  }, [setLanguage]);

  return null;
}
