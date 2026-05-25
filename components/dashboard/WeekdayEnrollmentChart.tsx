'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const DATA_FA = [
  { day: 'شنبه', enrollments: 42 },
  { day: 'یکشنبه', enrollments: 68 },
  { day: 'دوشنبه', enrollments: 91 },
  { day: 'سه‌شنبه', enrollments: 85 },
  { day: 'چهارشنبه', enrollments: 74 },
  { day: 'پنجشنبه', enrollments: 110 },
  { day: 'جمعه', enrollments: 48 }
];

const DATA_EN = [
  { day: 'Sat', enrollments: 42 },
  { day: 'Sun', enrollments: 68 },
  { day: 'Mon', enrollments: 91 },
  { day: 'Tue', enrollments: 85 },
  { day: 'Wed', enrollments: 74 },
  { day: 'Thu', enrollments: 110 },
  { day: 'Fri', enrollments: 48 }
];

const chartConfig: ChartConfig = {
  enrollments: { label: 'Enrollments', color: 'hsl(var(--chart-1))' }
};

export default function WeekdayEnrollmentChart() {
  const { language } = useTranslation();
  const t = language === 'fa';
  const data = t ? DATA_FA : DATA_EN;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t ? 'ثبت‌نام بر اساس روز' : 'Enrollments by day'}
            </p>
            <CardTitle className="mt-1 text-base">
              {t ? 'هفته‌ی جاری' : 'This week'}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="gap-1 border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
          >
            <TrendingUp className="h-3 w-3" />
            +18%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barSize={28}
              margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="enrollments"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
