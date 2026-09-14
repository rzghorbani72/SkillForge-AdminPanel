'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { getLocaleForLanguage } from '@/lib/i18n/config';
import { formatCurrencyWithStore } from '@/lib/utils';
import { ChartLoading, useChartReveal } from './chart-motion';
import type { MoneyBucket } from '@/types/dashboard';

type Props = {
  series: MoneyBucket[];
  grain: 'day' | 'week' | 'month';
  period: string;
  isLoading: boolean;
};

/** The three segments add up to gross. Discounts are not in the stack: they
    were never collected, so adding them would draw a bar taller than income. */
const SEGMENTS = [
  ['net', 'var(--viz-1)'],
  ['teacher_payouts', 'var(--viz-2)'],
  ['refunds', 'var(--viz-4)'],
] as const;

/**
 * One stacked bar per bucket: the segments add up to gross, so a manager sees
 * both what came in and how much of it left again.
 */
export default function MoneyFlowChart({ series, grain, period, isLoading }: Props) {
  const { t, language } = useTranslation();
  const academy = useCurrentAcademy();
  const showChart = useChartReveal(isLoading);

  const chartConfig: ChartConfig = {
    net: { label: t('dashboard.money.net'), color: 'hsl(var(--viz-1))' },
    teacher_payouts: {
      label: t('dashboard.money.colPayout'),
      color: 'hsl(var(--viz-2))',
    },
    refunds: {
      label: t('dashboard.money.colRefunds'),
      color: 'hsl(var(--viz-4))',
    },
  };

  const data = useMemo(
    () =>
      series.map((bucket) => ({
        ...bucket,
        label: new Date(bucket.label).toLocaleDateString(
          getLocaleForLanguage(language),
          grain === 'month' ? { month: 'short' } : { day: 'numeric', month: 'short' },
        ),
      })),
    [series, grain, language],
  );

  const gross = series.reduce((sum, bucket) => sum + bucket.gross, 0);

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 pb-0">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t('dashboard.money.flowTitle')}
          </p>
          <CardTitle className="mt-1 text-base">{t('dashboard.money.flowSubtitle')}</CardTitle>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {SEGMENTS.map(([key, color]) => (
              <span key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: `hsl(${color})` }}
                />
                {chartConfig[key].label}
              </span>
            ))}
          </div>
        </div>
        <div className="text-end">
          <p className="text-xs text-muted-foreground">{t('dashboard.money.gross')}</p>
          {isLoading ? (
            <div className="shimmer mt-1 h-6 w-24 rounded-md" />
          ) : (
            <p className="mt-0.5 text-xl font-bold tabular-nums">
              {formatCurrencyWithStore(gross, academy, undefined, language)}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {!showChart ? (
          <ChartLoading className="h-[260px] w-full" label={t('dashboard.loadingDashboardData')} />
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart key={period} data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              {SEGMENTS.map(([key, color]) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="money"
                  fill={`hsl(${color})`}
                  radius={key === 'refunds' ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
