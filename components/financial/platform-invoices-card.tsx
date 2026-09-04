'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SubscriptionInvoicesList } from '@/components/plans/subscription-invoices-list';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * Money the manager pays the platform for their subscription — deliberately kept
 * apart from academy income, because it is a cost, not revenue.
 */
export function PlatformInvoicesCard() {
  const { t } = useTranslation();
  const { subscription, isLoading } = useAcademySubscription(true);

  const invoices = useMemo(
    () =>
      (subscription?.invoices ?? []).filter(
        (invoice) =>
          invoice.status === 'PAID' ||
          invoice.status === 'FAILED' ||
          invoice.status === 'DUPLICATE'
      ),
    [subscription?.invoices]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t('financial.store.overview.platformPayments')}
        </CardTitle>
        <CardDescription>
          {t('financial.store.overview.platformPaymentsHint')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <SubscriptionInvoicesList invoices={invoices} />
        )}
      </CardContent>
    </Card>
  );
}
