'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { cn } from '@/lib/utils';
import { MoneyValue } from './money-value';

const LINES = [
  'hsl(var(--viz-1))',
  'hsl(var(--viz-2))',
  'hsl(var(--viz-3))',
  'hsl(var(--viz-1))',
  'hsl(var(--viz-2))'
];

export type CardModel = {
  key: string;
  title: string;
  value: number;
  /** Shown instead of the money value, e.g. a percentage. */
  valueLabel?: string;
  hint: string;
  icon: typeof DollarSign;
  /** Whole-percent move against the previous window; null when there is no base. */
  change: number | null;
  meter?: number;
};

export function MoneyCard({
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
              {card.valueLabel ? (
                <span className="text-2xl font-bold tracking-tight">
                  {card.valueLabel}
                </span>
              ) : (
                <MoneyValue value={card.value} />
              )}
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
