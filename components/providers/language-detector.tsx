'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { detectUserCountry } from '@/lib/geo-location';
import { getDefaultLanguageForCountry } from '@/lib/i18n/config';
import type { LanguageCode } from '@/lib/i18n/config';

interface LanguageDetectorProps {
  onDetected?: (countryCode: string, language: LanguageCode) => void;
  forceDetect?: boolean; // Force detection even if language is stored
}

export function LanguageDetector({
  onDetected,
  forceDetect = false
}: LanguageDetectorProps) {
  const { setLanguage, language } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run after component is mounted to avoid hydration issues
    if (!mounted) return;

    const detectLanguage = async () => {
      // Check if language is already set in localStorage (unless forced)
      if (!forceDetect) {
        const storedLanguage = localStorage.getItem('preferred_language');
        if (storedLanguage) {
          return; // Don't override user preference
        }
      }

      try {
        // Try to detect country from IP
        const country = await detectUserCountry();
        const detectedLanguage = getDefaultLanguageForCountry(country.code);

        // Only set if different from current and no preference stored
        const storedLanguage = localStorage.getItem('preferred_language');
        if (!storedLanguage && detectedLanguage !== language) {
          localStorage.setItem('preferred_language', detectedLanguage);
          setLanguage(detectedLanguage);
          onDetected?.(country.code, detectedLanguage);
        }
      } catch (error) {
        console.warn('Failed to detect location:', error);
      }
    };

    detectLanguage();
  }, [mounted, forceDetect, language, setLanguage, onDetected]); // Include dependencies

  return null;
}
