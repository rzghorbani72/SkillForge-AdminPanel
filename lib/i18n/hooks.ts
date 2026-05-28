/**
 * React hooks for i18n
 */

'use client';

import { useCallback } from 'react';
import { useI18n } from './provider';
import { t as translate, getTranslations } from './index';
import { getLocaleForLanguage, type LanguageCode } from './config';
import type { InterpolationParams } from './index';

/**
 * Hook to get translation function
 */
export function useTranslation() {
  const { language } = useI18n();

  const t = useCallback(
    (key: string, params?: InterpolationParams) =>
      translate(key, language, params),
    [language]
  );

  return { t, language, translations: getTranslations(language) };
}

/**
 * Hook to get language and direction info
 */
export function useLanguage() {
  const { language, direction, isRTL, config } = useI18n();

  return {
    language,
    direction,
    isRTL: true,
    config,
    locale: getLocaleForLanguage(language)
  };
}
