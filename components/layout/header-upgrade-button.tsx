'use client';

import Link from '@/components/ui/link';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

/**
 * Header shortcut in the header for the academy manager. Turns solid/urgent
 * when the plan is expiring or expired; subtle otherwise. Business has no
 * higher self-serve tier, so once it's paid and active there is nothing to
 * "upgrade" to — the label switches to a neutral "manage plan", and only
 * reverts to an urgent CTA (labeled as a renewal, not an upgrade) if it's
 * actually expiring or expired.
 */
export function HeaderUpgradeButton() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const canManage = canManageSubscription(user);
  const { shouldShowUpgrade, isTopPlan, isLoading } =
    useAcademySubscription(canManage);

  if (!canManage || isLoading) {
    return null;
  }

  const isUrgent = shouldShowUpgrade;
  const label =
    isTopPlan && !isUrgent
      ? t('sidebar.manageSubscription')
      : isTopPlan && isUrgent
        ? t('sidebar.renewPlan')
        : t('sidebar.upgradePlan');

  return (
    <Link
      href="/plans"
      title={label}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold transition-opacity hover:opacity-90 sm:px-3',
        isUrgent
          ? 'bg-primary text-primary-foreground'
          : 'border border-border/60 bg-muted/50 text-foreground'
      )}
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
