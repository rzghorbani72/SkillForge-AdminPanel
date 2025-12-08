'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { getDefaultLanguageForCountry } from '@/lib/i18n/config';
import { authService } from '@/lib/auth';
import type { LanguageCode } from '@/lib/i18n/config';

export function LanguageSync() {
  const { setLanguage, language } = useI18n();

  useEffect(() => {
    // Check if language is already set in localStorage (user preference)
    const storedLanguage = localStorage.getItem('preferred_language');
    if (storedLanguage) {
      return; // Don't override user preference
    }

    // Try to get country code from current store
    const currentUser = authService.getCurrentUser();
    const countryCode = currentUser?.currentStore?.country_code;

    if (countryCode) {
      const detectedLanguage = getDefaultLanguageForCountry(countryCode);

      // Only set if different from current
      if (detectedLanguage !== language) {
        // Update localStorage and reload to apply
        localStorage.setItem('preferred_language', detectedLanguage);
        setLanguage(detectedLanguage);
      }
    }
  }, []); // Only run once on mount

  return null;
}
