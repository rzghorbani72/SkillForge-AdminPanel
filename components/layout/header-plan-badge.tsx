'use client';

import Link from '@/components/ui/link';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { getSubscriptionStatusDisplay, SUBSCRIPTION_TONE_CLASSES } from '@/lib/subscription-status';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

/** Days left is only worth header space when the plan is close to lapsing. */
const EXPIRY_WARNING_DAYS = 7;

/**
 * The active academy's plan, always visible in the header. Each academy has its
 * own subscription, so this follows the academy selector, not the user.
 */
export function HeaderPlanBadge() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { user } = useAuthUser();
  const canManage = canManageSubscription(user);
  const { planName, status, isTrial, daysRemaining, hasAcademy, isLoading } =
    useAcademySubscription(canManage);

  if (!canManage || !hasAcademy || isLoading) {
    return null;
  }

  const display = getSubscriptionStatusDisplay(status, isTrial);
  const name = planName ?? t(display.labelKey);
  const days = daysRemaining != null ? formatNumber(daysRemaining) : null;

  let detail: string | null = null;
  if (status === 'GRACE' && days) {
    detail = t('header.planDaysToPay', { days });
  } else if (status === 'EXPIRED') {
    detail = t('subscriptionStatus.expired');
  } else if (
    status === 'ACTIVE' &&
    daysRemaining != null &&
    days &&
    (isTrial || daysRemaining <= EXPIRY_WARNING_DAYS)
  ) {
    detail = t('header.planDaysLeft', { days });
  } else if (isTrial) {
    detail = t('subscriptionStatus.trial');
  }

  const label = detail ? `${name} · ${detail}` : name;

  return (
    <Link
      href="/plans"
      title={label}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-xl border border-transparent px-2 text-xs font-semibold transition-opacity hover:opacity-90 sm:max-w-[13rem] sm:px-3 sm:text-sm',
        SUBSCRIPTION_TONE_CLASSES[display.tone],
      )}
    >
      <Crown className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden truncate sm:inline">{label}</span>
    </Link>
  );
}
