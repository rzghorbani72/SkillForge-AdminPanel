/**
 * Server-side i18n utilities
 * Used in server components to determine language and direction
 */

import 'server-only';

import {
  getDefaultLanguageForCountry,
  getLanguageConfig,
  isRTL,
  getTextDirection
} from './config';
import type { LanguageCode, TextDirection } from './config';

/**
 * Get language configuration for admin panel
 * Determines language from user preference or falls back to country default
 */
export function getAdminLanguage(
  userLanguage?: string | null,
  countryCode?: string | null
): LanguageCode {
  // If user has explicit language preference, use it
  if (userLanguage) {
    const validLanguage = userLanguage.toLowerCase() as LanguageCode;
    // Validate it's a supported language
    const supportedLanguages: LanguageCode[] = [
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
    ];
    if (supportedLanguages.includes(validLanguage)) {
      return validLanguage;
    }
  }

  // Fall back to country default
  if (countryCode) {
    return getDefaultLanguageForCountry(countryCode);
  }

  // Default to English
  return 'en';
}

/**
 * Get text direction for admin panel
 */
export function getAdminDirection(
  userLanguage?: string | null,
  countryCode?: string | null
): TextDirection {
  const language = getAdminLanguage(userLanguage, countryCode);
  return getTextDirection(language);
}

/**
 * Check if admin panel uses RTL
 */
export function isAdminRTL(
  userLanguage?: string | null,
  countryCode?: string | null
): boolean {
  const language = getAdminLanguage(userLanguage, countryCode);
  return isRTL(language);
}

/**
 * Get full language configuration for admin panel
 */
export function getAdminLanguageConfig(
  userLanguage?: string | null,
  countryCode?: string | null
) {
  const language = getAdminLanguage(userLanguage, countryCode);
  return getLanguageConfig(language);
}
