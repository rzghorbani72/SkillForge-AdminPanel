'use client';

import { useCallback } from 'react';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { MetricsCurrency } from '@/lib/api';

/** Keys the backend returns already converted into the display currency. */
const MONEY_KEYS = new Set([
  'mrr',
  'arr',
  'arpa',
  'new_mrr',
  'expansion_mrr',
  'contraction_mrr',
  'churned_mrr',
  'ending_mrr',
  'starting_mrr',
  'gmv_paid_amount',
  'gmv_refunded_amount',
  'marketing_spend',
  'cac',
  'ltv',
  'monthly_burn',
  'lifetime_paid',
  'last_invoice_amount',
  'amount'
]);

const RATIO_KEYS = new Set([
  'nrr',
  'grr',
  'logo_retention',
  'monthly_logo_churn',
  'activation_rate',
  'trial_conversion_rate',
  'stickiness',
  'checkout_success_rate',
  'refund_rate',
  'gross_margin',
  'retention',
  'logo_churn_rate'
]);

export function isMoneyKey(key: string): boolean {
  return MONEY_KEYS.has(key);
}

/**
 * One formatter for every figure on the page, so digits follow the UI language
 * and a ratio never renders as "0.8889" where a reader expects a percentage.
 */
export function useMetricFormat(currency: MetricsCurrency) {
  const formatNumber = useNumberFormat();

  return useCallback(
    (key: string, value: number | null | undefined): string => {
      if (value === null || value === undefined) {
        return '—';
      }
      if (RATIO_KEYS.has(key)) {
        return `${formatNumber(Math.round(value * 1000) / 10)}٪`.replace(
          '٪',
          '%'
        );
      }
      if (MONEY_KEYS.has(key)) {
        return formatNumber(
          currency === 'EUR' ? Math.round(value * 100) / 100 : Math.round(value)
        );
      }
      return formatNumber(Math.round(value * 100) / 100);
    },
    [currency, formatNumber]
  );
}
