'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTrendPeriod } from '@/app/(protected)/analytics/_components/format-trend-period';
import { rialToToman } from '@/app/(protected)/analytics/_hooks/use-iran-money';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { DeskGrossPoint } from '@/types/financial';

type DeskRevenueChartsProps = {
  trend: DeskGrossPoint[];
  loading: boolean;
};

export function DeskRevenueCharts({ trend, loading }: DeskRevenueChartsProps) {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const isRtl = language === 'fa' || language === 'ar';

  const chartConfig: ChartConfig = {
    academy: {
      label: t('financial.desk.academyGross'),
      color: 'hsl(var(--chart-1))'
    },
    platform: {
      label: t('financial.desk.platformGross'),
      color: 'hsl(var(--chart-2))'
    }
  };

  const monthly = useMemo(
    () =>
      trend.map((point) => ({
        month: formatTrendPeriod(point.period, language),
        academy: rialToToman(point.academy_gross),
        platform: rialToToman(point.platform_gross)
      })),
    [trend, language]
  );

  const cumulative = useMemo(
    () =>
      trend.map((point) => ({
        month: formatTrendPeriod(point.period, language),
        academy: rialToToman(point.academy_cumulative),
        platform: rialToToman(point.platform_cumulative)
      })),
    [trend, language]
  );

  const tomanTick = (value: number) => formatNumber(value);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[320px] w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  if (trend.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('financial.desk.noTrend')}
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2" dir={isRtl ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle>{t('financial.desk.monthlyGross')}</CardTitle>
          <CardDescription>
            {t('financial.desk.monthlyGrossHint')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart
              data={monthly}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                reversed={isRtl}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={tomanTick}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="academy" fill="var(--color-academy)" radius={4} />
              <Bar dataKey="platform" fill="var(--color-platform)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('financial.desk.cumulativeGross')}</CardTitle>
          <CardDescription>
            {t('financial.desk.cumulativeGrossHint')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <AreaChart
              data={cumulative}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                reversed={isRtl}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={tomanTick}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="academy"
                stroke="var(--color-academy)"
                fill="var(--color-academy)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="platform"
                stroke="var(--color-platform)"
                fill="var(--color-platform)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
