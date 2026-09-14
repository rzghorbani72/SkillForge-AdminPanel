'use client';

import { useCallback } from 'react';
import { useTranslation } from './hooks';
import { useNumberFormat } from './use-number-format';

/**
 * Percentages are shown all over the panel (upload progress, discounts). The
 * digits and the sign both change with the language (۵۰٪ in Persian), so they
 * go through one formatter instead of a hardcoded `${n}%`.
 */
export function usePercentLabel() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  return useCallback(
    (value: number) => t('common.percentValue', { value: formatNumber(Math.round(value)) }),
    [t, formatNumber],
  );
}
