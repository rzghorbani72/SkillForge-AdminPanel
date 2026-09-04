'use client';

import { useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

export const RIALS_PER_TOMAN = 10;

export function rialToToman(rial: number): number {
  return Math.round(rial / RIALS_PER_TOMAN);
}

/** Totals and charts: human-facing Toman. Details: bank/gateway Rial. Never USD. */
export function useIranMoney() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  const formatTomanFromRial = useCallback(
    (rial: number) => `${formatNumber(rialToToman(rial))} ${t('common.toman')}`,
    [formatNumber, t]
  );

  const formatRial = useCallback(
    (rial: number) => `${formatNumber(Math.round(rial))} ${t('common.rial')}`,
    [formatNumber, t]
  );

  return { formatTomanFromRial, formatRial, rialToToman };
}
