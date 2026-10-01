'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { AcademyRevenueData, AcademyPayment } from '@/types/financial';
import { CourseRevenueBucket } from '../_lib/page-helpers';

export function RevenueSummaryCards({
  canSeeAnyRevenue,
  formatCurrency,
  formatNumber,
  payments,
  paymentsByCourse,
  primaryRevenue,
  revenueCurrency,
  revenueData,
}: {
  canSeeAnyRevenue: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  payments: AcademyPayment[];
  paymentsByCourse: CourseRevenueBucket[];
  primaryRevenue: { label: string; amount: number };
  revenueCurrency: string;
  revenueData: AcademyRevenueData;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{primaryRevenue.label}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {canSeeAnyRevenue ? formatCurrency(primaryRevenue.amount, revenueCurrency) : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.revenue.roleBasedDescription')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.revenue.totalPayments')}
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatNumber(payments.length)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.revenue.successfulTransactions')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.revenue.averagePayment')}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {revenueData.payment_count > 0
              ? formatCurrency(
                  revenueData.total_revenue / revenueData.payment_count,
                  revenueData.currency,
                )
              : formatCurrency(0, revenueData.currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.revenue.perTransaction')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.revenue.courses')}
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatNumber(paymentsByCourse.length)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.revenue.coursesWithPayments')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
