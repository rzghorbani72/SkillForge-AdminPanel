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
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import { CoursePerformance } from './useDashboard';
import { useTranslation } from '@/lib/i18n/hooks';
import { BarChart3 } from 'lucide-react';

type Props = {
  data: CoursePerformance[];
};

const CoursePerformanceChart = ({ data }: Props) => {
  const { t } = useTranslation();

  const chartConfig: ChartConfig = {
    students: {
      label: t('dashboard.students'),
      color: 'hsl(var(--chart-3))'
    },
    completionRate: {
      label: t('dashboard.completionRate'),
      color: 'hsl(var(--chart-4))'
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t('dashboard.coursePerformance')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.topPerformingCourses')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>{t('common.noData')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">
            {t('dashboard.coursePerformance')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.topPerformingCourses')}
          </CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <BarChart3 className="h-5 w-5 text-amber-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted/30"
              horizontal={false}
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={120}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="students"
              fill="hsl(var(--chart-3))"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="completionRate"
              fill="hsl(var(--chart-4))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CoursePerformanceChart;
