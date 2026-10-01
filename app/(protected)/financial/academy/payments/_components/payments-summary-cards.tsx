'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { AcademyRevenueData } from '@/types/financial';

export function PaymentsSummaryCards({
  formatCurrency,
  formatNumber,
  paymentStats,
  revenueData,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  paymentStats: { completed: number; pending: number; failed: number };
  revenueData: AcademyRevenueData;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.payments.totalRevenue')}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(revenueData.total_revenue, revenueData.currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.payments.fromPayments', {
              count: revenueData.payment_count,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.payments.completed')}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatNumber(paymentStats.completed)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.payments.successfulPayments')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.payments.pending')}
          </CardTitle>
          <CreditCard className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatNumber(paymentStats.pending)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.payments.awaitingProcessing')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.payments.failed')}
          </CardTitle>
          <CreditCard className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive">{formatNumber(paymentStats.failed)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.payments.failedTransactions')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
