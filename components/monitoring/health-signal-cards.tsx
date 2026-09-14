'use client';

import {
  AlertTriangle,
  CreditCard,
  Database,
  Gauge,
  LogIn,
  PlayCircle,
  ServerCrash,
} from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { HealthSignals } from '@/lib/api-academy-health';

export function HealthSignalCards({ signals }: { signals: HealthSignals }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();

  const rate = signals.error_rate_pct;
  const rateIsBad = rate !== null && rate >= 10;
  const hasServerErrors = signals.server_errors_24h > 0;
  const hasFailedPayments = signals.failed_payments_24h > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatsCard
        title={t('monitoring.activeLearners')}
        value={formatNumber(signals.active_learners_60m)}
        icon={PlayCircle}
        iconColor="text-primary"
      />
      <StatsCard
        title={t('monitoring.logins24h')}
        value={formatNumber(signals.logins_24h)}
        icon={LogIn}
        iconColor="text-primary"
      />
      <StatsCard
        title={t('monitoring.paidPayments24h')}
        value={formatNumber(signals.paid_payments_24h)}
        icon={CreditCard}
        iconColor="text-emerald-600 dark:text-emerald-400"
      />
      <StatsCard
        title={t('monitoring.failedPayments24h')}
        value={formatNumber(signals.failed_payments_24h)}
        icon={AlertTriangle}
        iconColor={hasFailedPayments ? 'text-destructive' : 'text-muted-foreground'}
        changeType={hasFailedPayments ? 'negative' : 'neutral'}
      />
      <StatsCard
        title={t('monitoring.errorRate')}
        value={
          rate === null
            ? t('monitoring.errorRateTooQuiet')
            : t('monitoring.percentValue', { value: formatNumber(rate) })
        }
        icon={Gauge}
        iconColor={rateIsBad ? 'text-destructive' : 'text-muted-foreground'}
        changeType={rateIsBad ? 'negative' : 'neutral'}
        description={t('monitoring.requestsCounted', {
          value: formatNumber(signals.requests_24h),
        })}
      />
      <StatsCard
        title={t('monitoring.serverErrors24h')}
        value={formatNumber(signals.server_errors_24h)}
        icon={ServerCrash}
        iconColor={hasServerErrors ? 'text-destructive' : 'text-muted-foreground'}
        changeType={hasServerErrors ? 'negative' : 'neutral'}
      />
      <StatsCard
        title={t('monitoring.dbLatency')}
        value={t('monitoring.msValue', {
          value: formatNumber(signals.db_latency_ms),
        })}
        icon={Database}
        iconColor="text-muted-foreground"
        description={
          signals.last_activity_at
            ? `${t('monitoring.lastActivity')}: ${formatDate(signals.last_activity_at, { hour: '2-digit', minute: '2-digit' })}`
            : t('monitoring.lastActivityNever')
        }
      />
    </div>
  );
}
