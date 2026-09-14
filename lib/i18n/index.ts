/**
 * Internationalization (i18n) utilities
 * Provides translation functions and language management
 */

import { DEFAULT_LANGUAGE, type LanguageCode } from './config';
import {
  getLanguageConfig,
  getDefaultLanguageForCountry,
  getLocaleForLanguage,
  isRTL,
  getTextDirection,
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
  tr,
} as const;

type LoadedLanguage = keyof typeof translations;

function translationPack(language: LanguageCode) {
  if (language in translations) {
    return translations[language as LoadedLanguage];
  }
  return translations.en;
}

export type TranslationKey = keyof typeof en;

/**
 * Interpolation params type
 */
export type InterpolationParams = Record<string, string | number>;

/**
 * Interpolate values into a string template
 * Replaces {{key}} with the corresponding value from params
 */
function interpolate(template: string, params?: InterpolationParams, locale?: string): string {
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    if (value === undefined) return match;
    return typeof value === 'number' ? value.toLocaleString(locale) : value;
  });
}

/**
 * Get translation for a key with optional interpolation
 */
export function t(
  key: string,
  language: LanguageCode = DEFAULT_LANGUAGE,
  params?: InterpolationParams,
): string {
  const resolveFromPack = (pack: Record<string, any>): string | null => {
    const keys = key.split('.');
    let value: any = pack;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        return null;
      }
    }

    return typeof value === 'string' ? value : null;
  };

  const locale = getLocaleForLanguage(language);

  const localizedValue = resolveFromPack(translationPack(language) as any);
  if (localizedValue !== null) {
    return interpolate(localizedValue, params, locale);
  }

  const englishValue = resolveFromPack(translations.en as any);
  if (englishValue !== null) {
    return interpolate(englishValue, params, locale);
  }

  return key;
}

/**
 * Get all translations for a language
 */
export function getTranslations(language: LanguageCode = DEFAULT_LANGUAGE) {
  return translationPack(language);
}

/**
 * Get language from country code
 */
export function getLanguageFromCountry(countryCode: string | null | undefined): LanguageCode {
  if (!countryCode) return DEFAULT_LANGUAGE;
  return getDefaultLanguageForCountry(countryCode);
}

/**
 * Get language configuration
 */
export { getLanguageConfig, getDefaultLanguageForCountry, isRTL, getTextDirection };

/**
 * Re-export types
 */
export type { LanguageCode, TextDirection, LanguageConfig } from './config';
export { DEFAULT_LANGUAGE, getLocaleForLanguage } from './config';
