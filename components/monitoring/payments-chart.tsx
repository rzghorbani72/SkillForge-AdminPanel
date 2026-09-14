'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

export function PaymentsChart({ points }: { points: HealthDailyPoint[] }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();

  const config: ChartConfig = {
    paid_count: {
      label: t('monitoring.paid'),
      color: 'hsl(var(--chart-2))',
    },
    failed_count: {
      label: t('monitoring.failed'),
      color: 'hsl(var(--destructive))',
    },
  };

  const shortDay = (day: string) =>
    formatDate(day, { month: 'short', day: 'numeric', year: undefined });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('monitoring.paymentsChartTitle')}</CardTitle>
        <CardDescription>{t('monitoring.paymentsChartSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[260px] w-full">
          <BarChart data={points} margin={{ left: 4, right: 4, top: 8 }}>
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
            <Bar dataKey="paid_count" fill="var(--color-paid_count)" radius={3} />
            <Bar dataKey="failed_count" fill="var(--color-failed_count)" radius={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
