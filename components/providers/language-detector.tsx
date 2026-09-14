'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { DEFAULT_LANGUAGE } from '@/lib/i18n/config';
import type { LanguageCode } from '@/lib/i18n/config';

interface LanguageDetectorProps {
  onDetected?: (countryCode: string, language: LanguageCode) => void;
  forceDetect?: boolean; // Force detection even if language is stored
}

export function LanguageDetector({ onDetected, forceDetect = false }: LanguageDetectorProps) {
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

      const storedLanguage = localStorage.getItem('preferred_language');
      if (!storedLanguage && DEFAULT_LANGUAGE !== language) {
        localStorage.setItem('preferred_language', DEFAULT_LANGUAGE);
        setLanguage(DEFAULT_LANGUAGE);
        onDetected?.('IR', DEFAULT_LANGUAGE);
      }
    };

    detectLanguage();
  }, [mounted, forceDetect, language, setLanguage, onDetected]); // Include dependencies

  return null;
}
