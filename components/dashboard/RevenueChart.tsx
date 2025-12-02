'use client';

import React from 'react';
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
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import { ChartDataPoint } from './useDashboard';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

type Props = {
  data: ChartDataPoint[];
};

const RevenueChart = ({ data }: Props) => {
  const { t, language } = useTranslation();
  const school = useCurrentSchool();

  const chartConfig: ChartConfig = {
    revenue: {
      label: t('dashboard.revenue'),
      color: 'hsl(var(--chart-1))'
    }
  };

  // Calculate total and growth
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const lastMonthRevenue = data[data.length - 1]?.revenue || 0;
  const prevMonthRevenue = data[data.length - 2]?.revenue || 0;
  const growth =
    prevMonthRevenue > 0
      ? Math.round(
          ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
        )
      : 0;

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">
            {t('dashboard.revenueOverview')}
          </CardTitle>
          <CardDescription>{t('dashboard.last6Months')}</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">
            {formatCurrencyWithSchool(
              totalRevenue,
              school,
              undefined,
              language
            )}
          </p>
          {growth !== 0 && (
            <p
              className={`flex items-center justify-end gap-1 text-xs ${growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              <TrendingUp
                className={`h-3 w-3 ${growth < 0 ? 'rotate-180' : ''}`}
              />
              {growth > 0 ? '+' : ''}
              {growth}% {t('dashboard.vsLastMonth')}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
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
              tickFormatter={(value) =>
                formatCurrencyWithSchool(value, school, 1, language)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    formatCurrencyWithSchool(
                      Number(value),
                      school,
                      undefined,
                      language
                    )
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
