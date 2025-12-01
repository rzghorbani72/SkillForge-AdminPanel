/**
 * React hooks for i18n
 */

'use client';

import { useI18n } from './provider';
import { t as translate, getTranslations } from './index';
import type { LanguageCode } from './config';

/**
 * Hook to get translation function
 */
export function useTranslation() {
  const { language } = useI18n();

  return {
    t: (key: string) => translate(key, language),
    language,
    translations: getTranslations(language)
  };
}

/**
 * Hook to get language and direction info
 */
export function useLanguage() {
  const { language, direction, isRTL, config } = useI18n();

  return {
    language,
    direction,
    isRTL,
    config
  };
}
