'use client';

import { useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

/**
 * Course sales, wallets and settlements are stored and served in **Toman**, so
 * totals and charts print them as they arrive. Only a gateway's own confirmed
 * figure is Rial, and it is labelled as such. Never USD.
 */
export function useIranMoney() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  const formatToman = useCallback(
    (toman: number) =>
      `${formatNumber(Math.round(toman))} ${t('common.toman')}`,
    [formatNumber, t]
  );

  const formatRial = useCallback(
    (rial: number | null) =>
      rial === null
        ? '—'
        : `${formatNumber(Math.round(rial))} ${t('common.rial')}`,
    [formatNumber, t]
  );

  return { formatToman, formatRial };
}
