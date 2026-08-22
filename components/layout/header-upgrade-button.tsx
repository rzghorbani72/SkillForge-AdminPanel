'use client';

import Link from '@/components/ui/link';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { useTranslation } from '@/lib/i18n/hooks';
import { Sparkles } from 'lucide-react';

/**
 * Header shortcut for the academy manager. Always uses the green brand CTA
 * so "upgrade / renew / manage plan" stays visible in the header. The label
 * still switches: Business (top plan) with no urgency → manage; top plan
 * expiring → renew; otherwise → upgrade.
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
      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brandGreen px-2.5 text-sm font-semibold text-brandGreen-foreground transition-opacity hover:opacity-90 sm:px-3"
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
