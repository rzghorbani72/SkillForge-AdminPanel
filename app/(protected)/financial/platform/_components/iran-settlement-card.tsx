'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettlementTotals } from '@/types/financial';
import { useTranslation } from '@/lib/i18n/hooks';

export function IranSettlementCard({
  formatCurrency,
  settlementTotals,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  settlementTotals: SettlementTotals;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('financial.platform.iranSettlementTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('financial.platform.iranSettlementDescription')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: t('financial.platform.gross'),
              value: formatCurrency(settlementTotals.gross_amount ?? 0, settlementTotals.currency),
            },
            {
              label: `${t('financial.platform.platformFee')} (${((settlementTotals as SettlementTotals & { vat_rate?: number }).vat_rate ?? 0.09) * 100}%)`,
              value: formatCurrency(settlementTotals.platform_fee ?? 0, settlementTotals.currency),
            },
            {
              label: t('financial.platform.vat'),
              value: formatCurrency(
                settlementTotals.tax_vat_amount ?? 0,
                settlementTotals.currency,
              ),
            },
            {
              label: t('financial.platform.schoolNet'),
              value: formatCurrency(
                settlementTotals.school_net_revenue ?? 0,
                settlementTotals.currency,
              ),
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
