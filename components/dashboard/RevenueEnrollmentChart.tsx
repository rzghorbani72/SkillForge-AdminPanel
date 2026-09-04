'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
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
    revenue: {
      label: t('dashboard.revenue'),
      color: 'hsl(var(--chart-1))'
    },
    enrollments: {
      label: t('dashboard.enrollments'),
      color: 'hsl(var(--chart-2))'
    }
  };

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalEnrollments = data.reduce((s, d) => s + d.enrollments, 0);

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t('dashboard.revenueOverview')}
          </p>
          <CardTitle className="mt-1 text-base">
            {t('dashboard.last6Months')}
          </CardTitle>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-end">
            <p className="text-xs text-muted-foreground">
              {t('dashboard.totalRevenue')}
            </p>
            <p className="text-xl font-bold tabular-nums">
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
            <p className="text-xl font-bold tabular-nums">
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
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="gradEnroll" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted/30"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
              width={40}
              tickFormatter={(value: number) => formatNumber(value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2.5}
              fill="url(#gradRevenue)"
            />
            <Area
              type="monotone"
              dataKey="enrollments"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2.5}
              fill="url(#gradEnroll)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
