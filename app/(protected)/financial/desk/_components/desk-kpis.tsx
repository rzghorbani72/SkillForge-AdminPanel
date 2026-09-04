'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIranMoney } from '@/app/(protected)/analytics/_hooks/use-iran-money';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SettlementDesk } from '@/types/financial';

type DeskKpisProps = {
  desk: SettlementDesk;
  loading: boolean;
};

export function DeskKpis({ desk, loading }: DeskKpisProps) {
  const { t } = useTranslation();
  const { formatTomanFromRial } = useIranMoney();

  const items = [
    {
      key: 'toDeposit',
      value: desk.to_deposit,
      hint: t('financial.desk.toDepositHint')
    },
    {
      key: 'pending',
      value: desk.pending_amount,
      hint: t('financial.desk.pendingHint')
    },
    {
      key: 'academyShare',
      value: desk.academy_share,
      hint: t('financial.desk.academyShareHint')
    },
    {
      key: 'platformShare',
      value: desk.platform_share,
      hint: t('financial.desk.platformShareHint')
    }
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t(`financial.desk.${item.key}`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-semibold tracking-tight">
                {formatTomanFromRial(item.value)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
