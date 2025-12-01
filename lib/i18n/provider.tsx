'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { LanguageCode, TextDirection, LanguageConfig } from './config';
import {
  getLanguageConfig,
  getDefaultLanguageForCountry,
  isRTL,
  getTextDirection
} from './config';

interface I18nContextValue {
  language: LanguageCode;
  direction: TextDirection;
  config: LanguageConfig;
  setLanguage: (language: LanguageCode) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: LanguageCode;
  countryCode?: string | null;
}

export function I18nProvider({
  children,
  initialLanguage,
  countryCode
}: I18nProviderProps) {
  // Check for stored language preference first
  let storedLanguage: LanguageCode | null = null;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('preferred_language');
    if (
      stored &&
      [
        'en',
        'fa',
        'ar',
        'tr',
        'de',
        'fr',
        'es',
        'it',
        'ru',
        'zh',
        'ja',
        'ko',
        'hi',
        'ur',
        'he'
      ].includes(stored)
    ) {
      storedLanguage = stored as LanguageCode;
    }
  }

  // Determine initial language
  const defaultLanguage =
    storedLanguage ||
    initialLanguage ||
    (countryCode ? getDefaultLanguageForCountry(countryCode) : 'en');

  const config = getLanguageConfig(defaultLanguage);
  const direction = config.direction;
  const rtl = isRTL(defaultLanguage);

  // Language switching functionality
  const setLanguage = (language: LanguageCode) => {
    // Store in both localStorage and cookie for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', language);
      // Set cookie that expires in 1 year
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `preferred_language=${language}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
    // Reload page to apply new language
    window.location.reload();
  };

  return (
    <I18nContext.Provider
      value={{
        language: defaultLanguage,
        direction,
        config,
        setLanguage,
        isRTL: rtl
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
