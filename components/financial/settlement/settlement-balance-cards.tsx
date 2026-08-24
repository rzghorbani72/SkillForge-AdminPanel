'use client';

import { Banknote, Clock, HandCoins, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SettlementSummary } from '@/lib/api-settlement';

interface SettlementBalanceCardsProps {
  summary: SettlementSummary;
}

/** The four numbers a manager actually asks about, in plain language. */
export function SettlementBalanceCards({
  summary
}: SettlementBalanceCardsProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();

  const cards = [
    {
      key: 'available',
      icon: Wallet,
      value: summary.balance.available,
      accent: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      key: 'pending',
      icon: Clock,
      value: summary.balance.pending,
      accent: 'text-amber-600 dark:text-amber-400'
    },
    {
      key: 'withdrawn',
      icon: Banknote,
      value: summary.balance.withdrawn_total,
      accent: 'text-muted-foreground'
    },
    {
      key: 'direct',
      icon: HandCoins,
      value: summary.totals.academy_collected_direct,
      accent: 'text-muted-foreground'
    }
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, icon: Icon, value, accent }) => (
        <Card key={key}>
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4" />
              {t(`settlement.balance.${key}.title`)}
            </div>
            <p className={`text-2xl font-bold tabular-nums ${accent}`}>
              {formatCurrency(value)}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              {t(`settlement.balance.${key}.hint`)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
