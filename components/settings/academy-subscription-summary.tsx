'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import Link from '@/components/ui/link';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';

export function AcademySubscriptionSummary() {
  const { t } = useTranslation();
  const { subscription, isLoading } = useAcademySubscription(true);

  const handleDownloadInvoice = async (invoiceId: number) => {
    const { apiClient } = await import('@/lib/api');
    const { ErrorHandler } = await import('@/lib/error-handler');
    try {
      const blob =
        await apiClient.downloadCurrentAcademySubscriptionInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscription-invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('settings.subscriptionTitle')}
        </CardTitle>
        <CardDescription>
          {t('settings.subscriptionReadOnlyHint')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <div className="flex justify-between">
              <span>{t('settings.subscriptionPlan')}</span>
              <span className="font-medium capitalize text-foreground">
                {subscription?.academy?.subscription_plan ||
                  t('settings.noPlan')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.subscriptionStatus')}</span>
              <span className="font-medium text-foreground">
                {subscription?.status || 'INACTIVE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.subscriptionExpires')}</span>
              <span className="font-medium text-foreground">
                {subscription?.academy?.subscription_expires
                  ? new Date(
                      subscription.academy.subscription_expires
                    ).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <Button asChild className="w-full">
              <Link href="/plans">
                {t('settings.managePlatformPlan')}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
            {subscription?.invoices?.length ? (
              <div className="rounded-md border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('settings.recentInvoices')}
                </p>
                <div className="space-y-2">
                  {subscription.invoices.slice(0, 5).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded border px-2 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">
                          #{invoice.id} - {invoice.plan_name}
                        </p>
                        <p className="text-xs">
                          {invoice.amount.toLocaleString()} {invoice.currency}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
