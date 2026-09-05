'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  HandCoins,
  DollarSign,
  TrendingDown,
  TrendingUp,
  TicketPercent,
  Wallet
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { cn, formatCurrencyWithStore, formatNumber } from '@/lib/utils';
import type { ManagerDashboard } from '@/types/dashboard';

const LINES = [
  'hsl(var(--viz-1))',
  'hsl(var(--viz-2))',
  'hsl(var(--viz-3))',
  'hsl(var(--viz-1))'
];

type CardModel = {
  key: string;
  title: string;
  value: string;
  hint: string;
  icon: typeof DollarSign;
  /** Whole-percent move against the previous window; null when there is no base. */
  change: number | null;
  meter?: number;
};

function MoneyCard({
  card,
  index,
  isLoading
}: {
  card: CardModel;
  index: number;
  isLoading: boolean;
}) {
  const percent = usePercentLabel();
  const line = LINES[index % LINES.length];
  const isUp = (card.change ?? 0) >= 0;
  const Trend = isUp ? TrendingUp : TrendingDown;

  return (
    <Card className="stat-card group flex flex-col">
      <CardContent className="flex flex-1 flex-col p-0">
        <div
          className="w-fit shrink-0 rounded-2xl p-2.5"
          style={{ background: `${line.slice(0, -1)} / 0.1)` }}
        >
          <card.icon className="h-5 w-5" style={{ color: line }} />
        </div>

        <p className="mt-4 text-[13px] font-medium text-muted-foreground">
          {card.title}
        </p>

        {isLoading ? (
          <>
            <div className="shimmer mt-2 h-7 w-24 rounded-lg" />
            <div className="shimmer mt-2 h-3 w-32 rounded-full" />
          </>
        ) : (
          <>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {card.value}
              </span>
              {card.change !== null ? (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-semibold',
                    isUp
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  <Trend className="h-3.5 w-3.5" />
                  {percent(Math.abs(card.change))}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            {card.meter !== undefined ? (
              <Progress value={card.meter} className="mt-3 h-1.5" />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

type Props = Pick<ManagerDashboard, 'money' | 'payouts_due'> & {
  isLoading: boolean;
};

/**
 * The four numbers a manager acts on: what came in, what they keep, what is
 * still owed to them, and how close they are to their plan's student cap.
 */
export default function MoneyCards({
  money,
  payouts_due: payoutsDue,
  isLoading
}: Props) {
  const { t, language } = useTranslation();
  const academy = useCurrentAcademy();

  const amount = (value: number) =>
    formatCurrencyWithStore(value, academy, undefined, language);

  const delta = (current: number, previous: number) =>
    previous === 0 ? null : Math.round(((current - previous) / previous) * 100);

  const cards: CardModel[] = [
    {
      key: 'gross',
      title: t('dashboard.money.gross'),
      value: amount(money.gross),
      hint: t('dashboard.money.grossHint'),
      icon: DollarSign,
      change: delta(money.gross, money.gross_previous)
    },
    {
      key: 'net',
      title: t('dashboard.money.net'),
      value: amount(money.net),
      hint: t('dashboard.money.netHint'),
      icon: Wallet,
      change: delta(money.net, money.net_previous)
    },
    {
      key: 'payouts',
      title: t('dashboard.money.payoutsDue'),
      value: amount(payoutsDue.amount),
      hint: t('dashboard.money.payoutsDueHint', {
        count: formatNumber(payoutsDue.count, language)
      }),
      icon: HandCoins,
      change: null
    },
    {
      key: 'discounts',
      title: t('dashboard.money.discounts'),
      value: amount(money.discounts),
      hint: t('dashboard.money.discountsHint'),
      icon: TicketPercent,
      change: null
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <MoneyCard
          key={card.key}
          card={card}
          index={index}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
