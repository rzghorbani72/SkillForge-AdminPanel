'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardStatsCard } from './useDashboard';
import { cn } from '@/lib/utils';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ChartLoading, useChartReveal } from './chart-motion';

/** One hue in four steps — the cards read as a set, not four unrelated tiles. */
const LINES = [
  'hsl(var(--viz-1))',
  'hsl(var(--viz-2))',
  'hsl(var(--viz-3))',
  'hsl(var(--viz-1))'
];

export function StatCard({
  card,
  index,
  period,
  isLoading,
  loadingLabel
}: {
  card: DashboardStatsCard;
  index: number;
  period: string;
  isLoading: boolean;
  loadingLabel: string;
}) {
  const line = LINES[index % LINES.length];
  const isIncrease = card.changeType === 'increase';
  const sparkData = card.trend.map((v) => ({ v }));
  const gradientId = `spark-${index}-${period}`;
  const showChart = useChartReveal(isLoading);

  return (
    <Card className="stat-card group flex flex-col">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${line}, transparent)`
        }}
      />
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="flex items-start justify-between gap-3">
          <div
            className="shrink-0 rounded-2xl p-2.5"
            style={{ background: `${line.slice(0, -1)} / 0.1)` }}
          >
            <card.icon className="h-5 w-5" style={{ color: line }} />
          </div>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="card-corner-btn"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
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
              <p className="text-[28px] font-bold tabular-nums leading-none tracking-tight">
                {card.value}
              </p>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
                  isIncrease
                    ? 'text-[hsl(var(--viz-accent))]'
                    : 'text-destructive'
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
            <p className="mt-2 truncate text-xs text-muted-foreground">
              {card.description}
            </p>
          </>
        )}

        <div className="mx-auto mt-auto h-11 w-[88%] pt-3">
          {showChart ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={period}
                data={sparkData}
                margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={line} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={line} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={line}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  isAnimationActive
                  animationDuration={900}
                  animationBegin={index * 90}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartLoading className="h-full w-full" label={loadingLabel} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsCards({
  cards,
  period,
  isLoading,
  loadingLabel
}: {
  cards: DashboardStatsCard[];
  period: string;
  isLoading: boolean;
  loadingLabel: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <StatCard
          key={card.title}
          card={card}
          index={i}
          period={period}
          isLoading={isLoading}
          loadingLabel={loadingLabel}
        />
      ))}
    </div>
  );
}
