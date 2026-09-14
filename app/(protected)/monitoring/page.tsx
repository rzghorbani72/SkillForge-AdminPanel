'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { HealthStatusBanner } from '@/components/monitoring/health-status-banner';
import { HealthSignalCards } from '@/components/monitoring/health-signal-cards';
import { ActivityChart } from '@/components/monitoring/activity-chart';
import { PaymentsChart } from '@/components/monitoring/payments-chart';
import { ErrorRateChart } from '@/components/monitoring/error-rate-chart';
import { ErrorPanel } from '@/components/monitoring/error-panel';
import { useHealthSeries, useHealthSignals } from '@/hooks/use-academy-health';
import { HEALTH_RANGES, type HealthRange } from '@/lib/api-academy-health';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

export default function MonitoringPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [days, setDays] = useState<HealthRange>(7);

  const signals = useHealthSignals();
  const series = useHealthSeries(days);

  const isFirstLoad = signals.isLoading && !signals.data;

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        <PageHeader title={t('monitoring.title')} description={t('monitoring.subtitle')}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void signals.refresh();
              void series.refresh();
            }}
          >
            <RefreshCw className={cn('me-2 h-4 w-4', signals.isFetching && 'animate-spin')} />
            {t('monitoring.retry')}
          </Button>
        </PageHeader>

        {isFirstLoad ? (
          <LoadingSpinner variant="minimal" />
        ) : signals.error ? (
          <p className="text-sm text-destructive">{t('monitoring.loadFailed')}</p>
        ) : signals.data ? (
          <>
            <HealthStatusBanner status={signals.data.status} />
            <HealthSignalCards signals={signals.data} />
            <p className="text-xs text-muted-foreground">
              {t('monitoring.checkedJustNow')} · {t('monitoring.uptimeNote')}
            </p>
          </>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {HEALTH_RANGES.map((range) => (
            <Button
              key={range}
              variant={range === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(range)}
            >
              {t('monitoring.errorsWindow', { days: formatNumber(range) })}
            </Button>
          ))}
        </div>

        {series.data ? (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
              <ActivityChart points={series.data.points} />
              <PaymentsChart points={series.data.points} />
            </div>
            <ErrorRateChart points={series.data.points} />
            <ErrorPanel
              topErrors={series.data.top_errors}
              topPaymentFailures={series.data.top_payment_failures}
              windowDays={series.data.errors_window_days}
              rangeDays={series.data.days}
            />
          </>
        ) : series.isLoading ? (
          <LoadingSpinner variant="minimal" />
        ) : null}
      </div>
    </PageContainer>
  );
}
