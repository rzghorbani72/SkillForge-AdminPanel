/**
 * React hooks for i18n
 */

'use client';

import { useI18n } from './provider';
import { t as translate, getTranslations } from './index';
import type { LanguageCode } from './config';
import type { InterpolationParams } from './index';

/**
 * Hook to get translation function
 */
export function useTranslation() {
  const { language } = useI18n();

  return {
    t: (key: string, params?: InterpolationParams) =>
      translate(key, language, params),
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
