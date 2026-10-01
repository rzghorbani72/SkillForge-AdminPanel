'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import type { ReconciliationData } from '@/types/financial';

export function ReconciliationCard({
  formatNumber,
  reconciliation,
}: {
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  reconciliation: ReconciliationData;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('financial.store.payments.reconciliationTitle')}</CardTitle>
        <CardDescription>{t('financial.store.payments.reconciliationDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              key: 'paidPayments',
              value: reconciliation.total_paid_payments,
            },
            {
              key: 'matchedCallbacks',
              value: reconciliation.matched_successful_callbacks,
            },
            {
              key: 'missingCallbacks',
              value: reconciliation.missing_successful_callbacks,
            },
            {
              key: 'orphanCallbacks',
              value: reconciliation.orphan_successful_callbacks,
            },
          ].map(({ key, value }) => (
            <div key={key} className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                {t(`financial.store.payments.${key}`)}
              </p>
              <p className="mt-1 text-base font-semibold">{formatNumber(value ?? 0)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
