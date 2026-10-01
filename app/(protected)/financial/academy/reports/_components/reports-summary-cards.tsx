'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

export function ReportsSummaryCards({
  formatCurrency,
  overview,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  overview: any;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.reports.totalRevenue')}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.revenue.total, overview.revenue.currency)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.reports.fromPayments', {
              count: overview.revenue.from_payments,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.reports.totalCost')}
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(overview.cost.total, overview.cost.currency)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.reports.platformCosts')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.reports.totalProfit')}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(overview.profit.total, overview.revenue.currency)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.reports.profitMargin', {
              margin: overview.profit.margin,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('financial.store.reports.enrollments')}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.statistics.enrollments}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('financial.store.reports.courses', {
              count: overview.statistics.courses,
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
