'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import type { JourneyStep } from './dashboard-metrics';
import { ChartLoading, useChartReveal } from './chart-motion';

/** One hue, deepening toward the finished step — colour marks depth, not category. */
const COLORS: Record<JourneyStep['key'], string> = {
  students: 'hsl(var(--viz-1) / 0.28)',
  enrolled: 'hsl(var(--viz-1) / 0.5)',
  active: 'hsl(var(--viz-1) / 0.75)',
  completed: 'hsl(var(--viz-accent))',
};

const LABELS: Record<JourneyStep['key'], { fa: string; en: string }> = {
  students: { fa: 'دانشجویان', en: 'Students' },
  enrolled: { fa: 'ثبت‌نام کرده', en: 'Enrolled' },
  active: { fa: 'در حال یادگیری', en: 'Learning now' },
  completed: { fa: 'تکمیل کرده', en: 'Completed' },
};

type Props = {
  steps: JourneyStep[];
  period: string;
  isLoading: boolean;
};

export default function ConversionFunnel({ steps, period, isLoading }: Props) {
  const { t: translate, language } = useTranslation();
  const t = language === 'fa';
  const max = steps[0]?.value ?? 0;
  const showChart = useChartReveal(isLoading);
  const loadingLabel = translate('dashboard.loadingDashboardData');

  const fmt = (n: number) => (t ? n.toLocaleString('fa-IR') : n.toLocaleString('en-US'));

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t ? 'مسیر دانشجو' : 'Student journey'}
        </p>
        <CardTitle className="text-base">
          {t ? 'از ثبت‌نام تا تکمیل' : 'Signup to completion'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!showChart ? (
          <ChartLoading className="h-[220px] w-full" label={loadingLabel} />
        ) : (
          <div key={period} className="flex flex-col gap-4">
            {steps.map((step, i) => {
              const previous = i === 0 ? null : steps[i - 1].value;
              const rate =
                previous && previous > 0 ? Math.round((step.value / previous) * 100) : null;

              return (
                <div key={step.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[13px]">{LABELS[step.key][t ? 'fa' : 'en']}</span>
                    <span className="flex items-center gap-2">
                      {rate !== null && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                          {fmt(rate)}%
                        </span>
                      )}
                      <span className="text-[13px] font-semibold tabular-nums">
                        {fmt(step.value)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted/70">
                    <div
                      className="funnel-bar h-full rounded-full"
                      style={{
                        width: max === 0 ? '0%' : `${(step.value / max) * 100}%`,
                        background: COLORS[step.key],
                        animationDelay: `${i * 90}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
