'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { HealthDailyPoint } from '@/lib/api-academy-health';

export function ActivityChart({ points }: { points: HealthDailyPoint[] }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();

  const config: ChartConfig = {
    logins: { label: t('monitoring.logins'), color: 'hsl(var(--chart-1))' },
    registrations: {
      label: t('monitoring.registrations'),
      color: 'hsl(var(--chart-2))',
    },
    active_watchers: {
      label: t('monitoring.watchers'),
      color: 'hsl(var(--chart-3))',
    },
  };

  const shortDay = (day: string) =>
    formatDate(day, { month: 'short', day: 'numeric', year: undefined });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('monitoring.activityChartTitle')}</CardTitle>
        <CardDescription>{t('monitoring.activityChartSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <AreaChart data={points} margin={{ left: 4, right: 4, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={shortDay}
            />
            <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={(v) => shortDay(String(v))} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {(['logins', 'registrations', 'active_watchers'] as const).map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                fill={`var(--color-${key})`}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
