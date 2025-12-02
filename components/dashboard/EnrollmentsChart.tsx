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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartDataPoint } from './useDashboard';
import { useTranslation } from '@/lib/i18n/hooks';
import { Users } from 'lucide-react';

type Props = {
  data: ChartDataPoint[];
};

const EnrollmentsChart = ({ data }: Props) => {
  const { t } = useTranslation();

  const chartConfig: ChartConfig = {
    enrollments: {
      label: t('dashboard.enrollments'),
      color: 'hsl(var(--chart-2))'
    }
  };

  // Calculate total and growth
  const totalEnrollments = data.reduce((sum, d) => sum + d.enrollments, 0);
  const lastMonthEnrollments = data[data.length - 1]?.enrollments || 0;
  const prevMonthEnrollments = data[data.length - 2]?.enrollments || 0;
  const growth =
    prevMonthEnrollments > 0
      ? Math.round(
          ((lastMonthEnrollments - prevMonthEnrollments) /
            prevMonthEnrollments) *
            100
        )
      : 0;

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">
            {t('dashboard.studentEnrollments')}
          </CardTitle>
          <CardDescription>{t('dashboard.monthlyEnrollments')}</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Users className="h-5 w-5 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold">{totalEnrollments}</span>
          <span className="text-sm text-muted-foreground">
            {t('dashboard.totalEnrollments')}
          </span>
          {growth !== 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                growth > 0
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-rose-500/10 text-rose-600'
              }`}
            >
              {growth > 0 ? '+' : ''}
              {growth}%
            </span>
          )}
        </div>

        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
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
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="enrollments"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EnrollmentsChart;
