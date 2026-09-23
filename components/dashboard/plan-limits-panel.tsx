'use client';

import Link from '@/components/ui/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';
import type { PlanLimitUsage } from '@/types/dashboard';

type Props = { limits: PlanLimitUsage[]; isLoading: boolean };

/** Above this share of a quota the row turns red: an upgrade is imminent. */
const CRITICAL_PERCENT = 90;
const WARNING_PERCENT = 70;

const barTone = (percent: number) =>
  percent >= CRITICAL_PERCENT
    ? '[&>div]:bg-rose-500'
    : percent >= WARNING_PERCENT
      ? '[&>div]:bg-amber-500'
      : '';

export default function PlanLimitsPanel({ limits, isLoading }: Props) {
  const { t, language } = useTranslation();
  const num = (value: number) => formatNumber(value, language);

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 pb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t('dashboard.limits.title')}
          </p>
          <CardTitle className="mt-1 text-base">{t('dashboard.limits.subtitle')}</CardTitle>
        </div>
        <Link
          href="/plans"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {t('dashboard.limits.upgrade')}
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </CardHeader>
      <CardContent className="grid gap-x-8 gap-y-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="shimmer h-3 w-28 rounded-full" />
                <div className="shimmer h-1.5 w-full rounded-full" />
              </div>
            ))
          : limits.map((row) => {
              const percent =
                row.limit > 0 ? Math.min(100, Math.round((row.used / row.limit) * 100)) : 0;
              return (
                <div key={row.key} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs font-medium">
                      {t(`dashboard.limits.${row.key}`)}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {num(row.used)} / {num(row.limit)}
                    </span>
                  </div>
                  <Progress value={percent} className={`h-1.5 ${barTone(percent)}`} />
                  <p className="text-[11px] text-muted-foreground">
                    {row.remaining === 0
                      ? t('dashboard.limits.full')
                      : t('dashboard.limits.remaining', {
                          count: num(row.remaining),
                        })}
                  </p>
                </div>
              );
            })}
      </CardContent>
    </Card>
  );
}
