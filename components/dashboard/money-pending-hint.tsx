'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn, formatCurrencyWithStore } from '@/lib/utils';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { TONE_CLASS } from './money-card';

/** The hint's amount turns orange while money is still on its way. */
export function PendingHint({ template, amount }: { template: string; amount: number }) {
  const { language } = useTranslation();
  const academy = useCurrentAcademy();
  const [before, after] = template.split('{{pending}}');
  return (
    <>
      {before}
      <span className={cn('font-medium', amount > 0 && TONE_CLASS.pending)}>
        {formatCurrencyWithStore(amount, academy, undefined, language)}
      </span>
      {after}
    </>
  );
}
