'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';

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
  enrollments: { label: 'Enrollments', color: 'hsl(var(--viz-1))' }
};

export default function WeekdayEnrollmentChart() {
  const { language } = useTranslation();
  const percentLabel = usePercentLabel();
  const formatNumber = useNumberFormat();
  const t = language === 'fa';
  const data = t ? DATA_FA : DATA_EN;
  const peakDay = data.reduce((a, b) =>
    b.enrollments > a.enrollments ? b : a
  );
  const peak = peakDay.enrollments;

  return (
    <Card className="dashboard-card h-full">
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
            className="gap-1 border-transparent bg-[hsl(var(--viz-accent)/0.12)] text-[hsl(var(--viz-accent))]"
          >
            <TrendingUp className="h-3 w-3" />+{percentLabel(18)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barSize={26}
              margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--viz-1) / 0.06)', radius: 10 }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="enrollments" radius={10}>
                {data.map((entry) => (
                  <Cell
                    key={entry.day}
                    fill={
                      entry.enrollments === peak
                        ? 'hsl(var(--viz-accent))'
                        : 'hsl(var(--viz-1) / 0.16)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <p className="mt-3 text-xs text-muted-foreground">
          {t ? 'شلوغ‌ترین روز' : 'Busiest day'}
          <span className="mx-1 font-semibold text-foreground">
            {peakDay.day}
          </span>
          <span className="tabular-nums">
            ({formatNumber(peak)} {t ? 'ثبت‌نام' : 'enrollments'})
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
