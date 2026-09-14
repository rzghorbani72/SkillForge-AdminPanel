'use client';

import { useCallback } from 'react';
import { formatCurrencyWithStore } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';

export function useFormatCurrency() {
  const { language } = useTranslation();
  const currentAcademy = useCurrentAcademy();

  return useCallback(
    (amount: number, currency?: string) => {
      // Prefer academy's configured currency; fall back to explicit arg or IRR
      if (currentAcademy) {
        return formatCurrencyWithStore(amount, currentAcademy, undefined, language);
      }
      return formatCurrencyWithStore(
        amount,
        {
          currency: (currency ?? 'IRR') as string,
          currency_symbol: currency === 'IRR' ? 'Toman' : (currency ?? 'IRR'),
          currency_position: 'after',
        },
        undefined,
        language,
      );
    },
    [currentAcademy, language],
  );
}
