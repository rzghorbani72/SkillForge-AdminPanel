'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { HealthDailyPoint } from '@/lib/api-academy-health';

/**
 * Unlike the error detail panel this covers the whole selected range: the rate
 * comes from the aggregate request counter, which is cheap enough to keep for a
 * quarter, not from the seven-day error trail.
 */
export function ErrorRateChart({ points }: { points: HealthDailyPoint[] }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();

  const config: ChartConfig = {
    error_rate_pct: {
      label: t('monitoring.errorRateSeries'),
      color: 'hsl(var(--destructive))',
    },
  };

  const shortDay = (day: string) =>
    formatDate(day, { month: 'short', day: 'numeric', year: undefined });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('monitoring.errorRateChartTitle')}</CardTitle>
        <CardDescription>{t('monitoring.errorRateChartSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[220px] w-full">
          <LineChart data={points} margin={{ left: 4, right: 4, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={shortDay}
            />
            <YAxis tickLine={false} axisLine={false} width={40} unit="%" domain={[0, 'auto']} />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={(v) => shortDay(String(v))} />}
            />
            {/* Days too quiet to rate stay as gaps rather than a misleading zero. */}
            <Line
              dataKey="error_rate_pct"
              type="monotone"
              stroke="var(--color-error_rate_pct)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
