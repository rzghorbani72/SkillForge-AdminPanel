'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useIranMoney } from '../_hooks/use-iran-money';

export function RevenueKpis({
  totalRevenue,
  averageTicket,
  totalRefunds,
  monthOverMonth
}: {
  totalRevenue: number;
  averageTicket: number;
  totalRefunds: number;
  monthOverMonth: number;
}) {
  const { t } = useTranslation();
  const formatPercent = usePercentLabel();
  const { formatToman } = useIranMoney();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('analytics.totalRevenue')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatToman(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">
            {t('analytics.acrossAllPayments')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('analytics.averageTicket')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatToman(averageTicket)}</p>
          <p className="text-xs text-muted-foreground">
            {t('analytics.perSuccessfulPayment')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('analytics.refunds')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">
            {formatToman(totalRefunds)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('analytics.processedRefunds')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('analytics.monthOverMonth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold ${
              monthOverMonth >= 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {monthOverMonth >= 0 ? '+' : ''}
            {formatPercent(monthOverMonth)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('analytics.changeComparedPrevious')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
