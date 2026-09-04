'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartDataPoint } from './useDashboard';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { formatCurrencyWithStore } from '@/lib/utils';

type Props = { data: ChartDataPoint[] };

export default function RevenueEnrollmentChart({ data }: Props) {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const currentAcademy = useCurrentAcademy();

  const chartConfig: ChartConfig = {
    revenue: { label: t('dashboard.revenue'), color: 'hsl(var(--viz-1))' },
    enrollments: {
      label: t('dashboard.enrollments'),
      color: 'hsl(var(--viz-2))'
    }
  };

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalEnrollments = data.reduce((s, d) => s + d.enrollments, 0);

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 pb-0">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t('dashboard.revenueOverview')}
          </p>
          <CardTitle className="mt-1 text-base">
            {t('dashboard.last6Months')}
          </CardTitle>
          <div className="mt-3 flex items-center gap-4">
            {(
              [
                ['revenue', 'var(--viz-1)'],
                ['enrollments', 'var(--viz-2)']
              ] as const
            ).map(([key, color]) => (
              <span
                key={key}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: `hsl(${color})` }}
                />
                {chartConfig[key].label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-end">
            <p className="text-xs text-muted-foreground">
              {t('dashboard.totalRevenue')}
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums">
              {formatCurrencyWithStore(
                totalRevenue,
                currentAcademy,
                undefined,
                language
              )}
            </p>
          </div>
          <div className="text-end">
            <p className="text-xs text-muted-foreground">
              {t('dashboard.totalEnrollments')}
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums">
              {formatNumber(totalEnrollments)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--viz-1))"
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--viz-1))"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="gradEnroll" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--viz-2))"
                  stopOpacity={0.22}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--viz-2))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="hsl(var(--viz-grid))"
              strokeDasharray="4 6"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={44}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value: number) => formatNumber(value)}
            />
            <ChartTooltip
              cursor={{
                stroke: 'hsl(var(--viz-1))',
                strokeWidth: 1,
                strokeDasharray: '4 4'
              }}
              content={<ChartTooltipContent />}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--viz-1))"
              strokeWidth={2.5}
              fill="url(#gradRevenue)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'white' }}
            />
            <Area
              type="monotone"
              dataKey="enrollments"
              stroke="hsl(var(--viz-2))"
              strokeWidth={2.5}
              fill="url(#gradEnroll)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'white' }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
