'use client';

import Link from '@/components/ui/link';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
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
  const canManageSubscription =
    user?.role === 'MANAGER' ||
    (user?.role === 'ADMIN' && !user?.isAdminProfile && !user?.platformLevel);
  const { shouldShowUpgrade, planName, daysRemaining, isLoading } =
    useAcademySubscription(canManageSubscription);

  if (!canManageSubscription) {
    return null;
  }

  const isUrgent = shouldShowUpgrade;
  const title = isUrgent
    ? planName
      ? t('sidebar.subscriptionExpiring', { plan: planName })
      : t('sidebar.upgradePlan')
    : planName
      ? t('sidebar.currentPlan', { plan: planName })
      : t('sidebar.manageSubscription');
  const description = isUrgent
    ? daysRemaining != null && daysRemaining <= 14
      ? t('sidebar.upgradeDescriptionExpiring', { days: daysRemaining })
      : t('sidebar.upgradeDescription')
    : t('sidebar.managePlanHint');
  const ctaLabel = isUrgent
    ? t('sidebar.upgradeButton')
    : t('sidebar.manageSubscription');

  if (isMinimized) {
    return (
      <div className="shrink-0 border-t border-[hsl(var(--sidebar-border))] p-3">
        <Link
          href="/plans"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
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
    <div className="shrink-0 border-t border-[hsl(var(--sidebar-border))] p-3">
      <div
        className={cn(
          'rounded-xl border p-3',
          isUrgent
            ? 'border-primary/30 bg-primary/5'
            : 'border-border/60 bg-muted/30'
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              isUrgent ? 'bg-primary/15' : 'bg-muted'
            )}
          >
            <Zap
              className={cn(
                'h-3.5 w-3.5',
                isUrgent ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <span className="text-xs font-semibold text-foreground">{title}</span>
        </div>
        {!isLoading ? (
          <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <Link
          href="/plans"
          className={cn(
            'flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90',
            isUrgent
              ? 'bg-primary text-primary-foreground'
              : 'border bg-background text-foreground'
          )}
        >
          {ctaLabel}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
