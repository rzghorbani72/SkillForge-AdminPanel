'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Crown, Calendar, HardDrive, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AcademySubscriptionState } from '@/hooks/use-academy-subscription';
import { getSubscriptionStatusDisplay, SUBSCRIPTION_TONE_CLASSES } from '@/lib/subscription-status';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import { SubscriptionPlanData, formatStorage } from '@/components/plans/plan-types';

export function CurrentSubscriptionBanner({
  currentSub,
  currentPlan,
  t,
  onBuyStorageAddon,
  isBuyingAddon,
}: {
  currentSub: AcademySubscriptionState | null;
  currentPlan: SubscriptionPlanData | null | undefined;
  t: (key: string, params?: Record<string, string | number>) => string;
  onBuyStorageAddon?: () => void;
  isBuyingAddon?: boolean;
}) {
  if (!currentSub?.academy) return null;
  const expiresAt = currentSub.academy.subscription_expires;
  const storageUsedGb = currentSub.storage?.usage_gb;
  const includedStorageGb = currentSub.storage?.included_gb;
  const warnLevel = currentSub.storage?.warn_level;
  const display = getSubscriptionStatusDisplay(currentSub.status, currentSub.is_trial);

  // Never selected/paid a plan: the `starter` value is only a DB default, not a
  // real subscription, so we must NOT render it as a plan (name, crown, quota).
  // Show a neutral "no plan yet — pick one below" state instead.
  if (currentSub.status === 'INACTIVE') {
    return (
      <div className="rounded-2xl border bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Crown className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{t('subscriptionStatus.noPlanTitle')}</p>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                  SUBSCRIPTION_TONE_CLASSES.inactive,
                )}
              >
                {t('subscriptionStatus.inactive')}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t('subscriptionStatus.startPlanHint')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">
              {currentSub.academy.custom_plan?.name ??
                currentPlan?.name ??
                getPlanDisplayName(currentSub.academy.subscription_plan)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  SUBSCRIPTION_TONE_CLASSES[display.tone],
                )}
              >
                {t(display.labelKey)}
              </span>
              {currentSub.has_paid && (
                <span>
                  {t(currentSub.period_months === 3 ? 'plans.termQuarterly' : 'plans.termMonthly')}
                </span>
              )}
              {expiresAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t('plans.expiresAt')} {new Date(expiresAt).toLocaleDateString('fa-IR')}
                </span>
              )}
            </div>
            {display.needsPlan && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t('subscriptionStatus.startPlanHint')}
              </p>
            )}
          </div>
        </div>

        {includedStorageGb !== undefined && storageUsedGb !== undefined && (
          <div className="flex gap-5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span className="font-semibold text-foreground">{formatStorage(storageUsedGb)}</span>
              <span className="text-xs">/ {formatStorage(includedStorageGb)}</span>
            </div>
          </div>
        )}
      </div>

      {includedStorageGb !== undefined && storageUsedGb !== undefined && (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('plans.storageUsed')}</span>
            <span>
              {formatStorage(storageUsedGb)} / {formatStorage(includedStorageGb)}
            </span>
          </div>
          <Progress
            value={Math.min((storageUsedGb / includedStorageGb) * 100, 100)}
            className={cn(
              'h-1.5',
              warnLevel === 'full' && '[&>div]:bg-destructive',
              warnLevel === 'warning' && '[&>div]:bg-amber-500',
            )}
          />
          {(warnLevel === 'warning' || warnLevel === 'full') && (
            <div
              className={cn(
                'flex flex-col gap-2 rounded-xl px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between',
                warnLevel === 'full'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-amber-500/10 text-amber-800 dark:text-amber-200',
              )}
            >
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {warnLevel === 'full'
                  ? t('plans.storageFull', {
                      gb: currentSub.storage?.addon_gb ?? 50,
                    })
                  : t('plans.storageAlmostFull', {
                      percent: currentSub.storage?.percent_used ?? 80,
                    })}
              </p>
              {onBuyStorageAddon && (
                <Button
                  type="button"
                  size="sm"
                  variant={warnLevel === 'full' ? 'destructive' : 'outline'}
                  disabled={isBuyingAddon}
                  onClick={onBuyStorageAddon}
                  className="shrink-0"
                >
                  {isBuyingAddon ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    t('plans.buyStorageAddon', {
                      gb: currentSub.storage?.addon_gb ?? 50,
                    })
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
