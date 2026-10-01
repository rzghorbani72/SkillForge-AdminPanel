'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';

export function PaymentsAnalyticsCards({
  formatCurrency,
  formatNumber,
  monetizationSummary,
  totals,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  monetizationSummary: any;
  totals: { revenue: number; completed: number; pending: number; failed: number };
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.totalRevenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          {monetizationSummary?.visibility?.can_view_store_revenue ? (
            <p className="text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
          ) : (
            <p className="text-2xl font-bold">{t('financial.store.revenue.hidden')}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {monetizationSummary?.visibility?.can_view_store_revenue
              ? t('analytics.acrossAllPayments')
              : t('financial.store.revenue.revenueHiddenPolicy')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('payments.completed')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatNumber(totals.completed)}</p>
          <p className="text-xs text-muted-foreground">{t('payments.successfulPayments')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('payments.pending')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatNumber(totals.pending)}</p>
          <p className="text-xs text-muted-foreground">{t('payments.awaitingConfirmation')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('payments.failed')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatNumber(totals.failed)}</p>
          <p className="text-xs text-muted-foreground">{t('payments.requiresFollowUp')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
