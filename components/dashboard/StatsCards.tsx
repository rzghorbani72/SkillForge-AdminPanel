'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStatsCard } from './useDashboard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({
  card,
  isLoading,
  className,
  compact = false,
}: {
  card: DashboardStatsCard;
  index?: number;
  period?: string;
  isLoading: boolean;
  loadingLabel?: string;
  className?: string;
  /** Tighter layout when stacked beside the square banner. */
  compact?: boolean;
}) {
  const isIncrease = card.changeType === 'increase';

  return (
    <Card className={cn('stat-card flex flex-col', className)}>
      <CardContent className="flex flex-1 flex-col justify-between gap-2 p-0">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="pt-1.5 text-sm font-medium leading-snug text-muted-foreground">
            {card.title}
          </p>
        </div>

        {isLoading ? (
          <>
            <div className="shimmer mt-1 h-7 w-24 rounded-md" />
            {!compact ? <div className="shimmer mt-2 h-3 w-32 rounded-full" /> : null}
          </>
        ) : (
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{card.value}</p>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
                  isIncrease
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400',
                )}
              >
                {isIncrease ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {card.change}
              </span>
            </div>
            {!compact ? (
              <p className="mt-1.5 text-xs text-muted-foreground">{card.description}</p>
            ) : (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatsCards({
  cards,
  period: _period,
  isLoading,
  loadingLabel: _loadingLabel,
}: {
  cards: DashboardStatsCard[];
  period: string;
  isLoading: boolean;
  loadingLabel: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} card={card} isLoading={isLoading} />
      ))}
    </div>
  );
}
