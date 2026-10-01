'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { RevenueVisibility, RevenueMetrics, MonetizationSummary } from '../_lib/page-helpers';

export function RoleBasedAccessCard({
  formatCurrency,
  metrics,
  monetizationSummary,
  revenueCurrency,
  vis,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  metrics: RevenueMetrics | undefined;
  monetizationSummary: MonetizationSummary;
  revenueCurrency: string;
  vis: RevenueVisibility | undefined;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('financial.store.revenue.roleBasedAccess')}</CardTitle>
        <CardDescription>{t('financial.store.revenue.roleBasedAccessDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">{t('financial.store.revenue.role')}</p>
          <p className="text-lg font-semibold">{getRoleLabel(monetizationSummary.role, t)}</p>
        </div>
        {[
          {
            key: 'platformRevenue',
            visible: vis?.can_view_platform_revenue,
            value: metrics?.platform_revenue,
          },
          {
            key: 'schoolRevenue',
            visible: vis?.can_view_store_revenue,
            value: metrics?.school_net_revenue ?? metrics?.teacher_gross_revenue,
          },
          {
            key: 'teacherRevenue',
            visible: vis?.can_view_teacher_revenue,
            value: metrics?.teacher_payout_revenue ?? metrics?.teacher_payout,
          },
        ].map(({ key, visible, value }) => (
          <div key={key} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{t(`financial.store.revenue.${key}`)}</p>
            <p className="mt-1 text-sm font-medium">
              {visible ? formatCurrency(Number(value ?? 0), revenueCurrency) : '—'}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
