'use client';

import type { ReactNode } from 'react';
import Link from '@/components/ui/link';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { cn } from '@/lib/utils';
import { MoneyValue } from './money-value';

export type CardModel = {
  key: string;
  title: string;
  value: number;
  /** Shown instead of the money value, e.g. a percentage. */
  valueLabel?: string;
  /** Colors the value when it is above zero: money waiting vs money settled. */
  tone?: 'pending' | 'paid';
  hint: ReactNode;
  icon: typeof DollarSign;
  /** Whole-percent move against the previous window; null when there is no base. */
  change: number | null;
  meter?: number;
  /** Optional destination — whole card becomes a link (e.g. teacher share settings). */
  href?: string;
};

export const TONE_CLASS = {
  pending: 'text-amber-600 dark:text-amber-400',
  paid: 'text-emerald-600 dark:text-emerald-400',
} as const;

function toneClass(card: CardModel): string | undefined {
  return card.tone && card.value > 0 ? TONE_CLASS[card.tone] : undefined;
}

export function MoneyCard({
  card,
  isLoading,
}: {
  card: CardModel;
  index?: number;
  isLoading: boolean;
}) {
  const percent = usePercentLabel();
  const isUp = (card.change ?? 0) >= 0;
  const Trend = isUp ? TrendingUp : TrendingDown;

  const body = (
    <CardContent className="flex flex-1 flex-col p-0">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
          <card.icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="pt-1.5 text-sm font-medium text-muted-foreground">{card.title}</p>
      </div>

      {isLoading ? (
        <>
          <div className="shimmer mt-3 h-7 w-24 rounded-md" />
          <div className="shimmer mt-2 h-3 w-32 rounded-full" />
        </>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            {card.valueLabel ? (
              <span className="text-2xl font-semibold tabular-nums tracking-tight">
                {card.valueLabel}
              </span>
            ) : (
              <MoneyValue value={card.value} className={toneClass(card)} />
            )}
            {card.change !== null ? (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  isUp
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400',
                )}
              >
                <Trend className="h-3.5 w-3.5" />
                {percent(Math.abs(card.change))}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{card.hint}</p>
          {card.meter !== undefined ? <Progress value={card.meter} className="mt-3 h-1.5" /> : null}
        </>
      )}
    </CardContent>
  );

  return (
    <Card
      className={cn(
        'stat-card flex flex-col',
        card.href && 'hover:border-primary/40 hover:bg-primary/5',
      )}
    >
      {card.href ? (
        <Link href={card.href} className="flex flex-1 flex-col outline-none">
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  );
}
