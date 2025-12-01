/**
 * Internationalization (i18n) utilities
 * Provides translation functions and language management
 */

import type { LanguageCode } from './config';
import {
  getLanguageConfig,
  getDefaultLanguageForCountry,
  isRTL,
  getTextDirection
} from './config';
import { en } from './translations/en';
import { fa } from './translations/fa';
import { ar } from './translations/ar';
import { tr } from './translations/tr';

// Import all translations
const translations = {
  en,
  fa,
  ar,
  tr
} as const;

export type TranslationKey = keyof typeof en;

/**
 * Get translation for a key
 */
export function t(key: string, language: LanguageCode = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[language] || translations.en;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey as keyof typeof value];
        } else {
          return key; // Return key if translation not found
        }
      }
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Get all translations for a language
 */
export function getTranslations(language: LanguageCode = 'en') {
  return translations[language] || translations.en;
}

/**
 * Get language from country code
 */
export function getLanguageFromCountry(
  countryCode: string | null | undefined
): LanguageCode {
  if (!countryCode) return 'en';
  return getDefaultLanguageForCountry(countryCode);
}

/**
 * Get language configuration
 */
export {
  getLanguageConfig,
  getDefaultLanguageForCountry,
  isRTL,
  getTextDirection
};

/**
 * Re-export types
 */
export type { LanguageCode, TextDirection, LanguageConfig } from './config';
