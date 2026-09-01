'use client';

import Link from '@/components/ui/link';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Zap } from 'lucide-react';

type SidebarUpgradeBannerProps = {
  isMinimized: boolean;
};

export function SidebarUpgradeBanner({
  isMinimized
}: SidebarUpgradeBannerProps) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const canManage = canManageSubscription(user);
  const {
    shouldShowUpgrade,
    planName,
    daysRemaining,
    isLoading,
    needsPlanPurchase,
    hasAcademy
  } = useAcademySubscription(canManage);

  if (!canManage || !hasAcademy) {
    return null;
  }

  const isUrgent = shouldShowUpgrade;
  const title = needsPlanPurchase
    ? t('sidebar.buyPlan')
    : isUrgent
      ? planName
        ? t('sidebar.subscriptionExpiring', { plan: planName })
        : t('sidebar.upgradePlan')
      : planName
        ? t('sidebar.currentPlan', { plan: planName })
        : t('sidebar.manageSubscription');
  const description = needsPlanPurchase
    ? t('sidebar.buyPlanDescription')
    : isUrgent
      ? daysRemaining != null && daysRemaining <= 14
        ? t('sidebar.upgradeDescriptionExpiring', { days: daysRemaining })
        : t('sidebar.upgradeDescription')
      : t('sidebar.managePlanHint');
  const ctaLabel = needsPlanPurchase
    ? t('sidebar.buyPlan')
    : isUrgent
      ? t('sidebar.upgradeButton')
      : t('sidebar.manageSubscription');

  if (isMinimized) {
    return (
      <div className="shrink-0 border-t border-[hsl(var(--sidebar-border))] p-2">
        <Link
          href="/plans"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
            isUrgent
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
          )}
          title={title}
        >
          <Zap className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-[hsl(var(--sidebar-border))] p-2">
      <div
        className={cn(
          'rounded-lg border p-2.5',
          isUrgent
            ? 'border-primary/30 bg-primary/5'
            : 'border-border/60 bg-muted/30'
        )}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md',
              isUrgent ? 'bg-primary/15' : 'bg-muted'
            )}
          >
            <Zap
              className={cn(
                'h-3 w-3',
                isUrgent ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <span className="text-xs font-semibold text-foreground">{title}</span>
        </div>
        {!isLoading ? (
          <p className="mb-2 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
        <Link
          href="/plans"
          className={cn(
            'flex items-center justify-center gap-1 px-3 py-1 text-[11px] font-semibold',
            isUrgent
              ? 'rounded-full bg-brandMint text-brandMint-foreground shadow-[0_12px_31px_-12px_rgba(48,255,180,0.6)] transition-transform hover:-translate-y-0.5'
              : 'rounded-lg border bg-background text-foreground transition-opacity hover:opacity-90'
          )}
        >
          {ctaLabel}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
