'use client';

import Link from '@/components/ui/link';
import type { AcademySubscriptionState } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

type StorageWarnLevel = NonNullable<AcademySubscriptionState['storage']>['warn_level'];

const STORAGE_BAR_CLASSES: Record<NonNullable<StorageWarnLevel>, string> = {
  ok: 'bg-primary',
  warning: 'bg-amber-500',
  full: 'bg-destructive',
};

interface HeaderPlanDetailsProps {
  planName: string;
  statusLabel: string;
  detail: string | null;
  subscription: AcademySubscriptionState | null;
  onNavigate: () => void;
}

export function HeaderPlanDetails({
  planName,
  statusLabel,
  detail,
  subscription,
  onNavigate,
}: HeaderPlanDetailsProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();

  const expiresAt = subscription?.academy?.subscription_expires;
  const storage = subscription?.storage;
  const storagePercent = storage
    ? Math.min(
        100,
        Math.max(
          0,
          storage.percent_used ??
            (storage.included_gb > 0 ? (storage.usage_gb / storage.included_gb) * 100 : 0),
        ),
      )
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">{planName}</p>
        <p className="text-xs text-muted-foreground">
          {detail ? `${statusLabel} · ${detail}` : statusLabel}
        </p>
      </div>

      {expiresAt && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t('plans.expiresAt')}</span>
          <span className="font-medium">{formatDate(expiresAt)}</span>
        </div>
      )}

      {storage && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t('plans.storageUsed')}</span>
            <span className="font-medium">
              {t('header.storageAmount', {
                used: formatNumber(storage.usage_gb, { maximumFractionDigits: 1 }),
                total: formatNumber(storage.included_gb),
              })}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full', STORAGE_BAR_CLASSES[storage.warn_level ?? 'ok'])}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      )}

      <Link
        href="/plans"
        onClick={onNavigate}
        className="inline-flex h-9 w-full items-center justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-muted"
      >
        {t('sidebar.upgradeButton')}
      </Link>
    </div>
  );
}
