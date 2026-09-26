'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { getSubscriptionStatusDisplay, SUBSCRIPTION_TONE_CLASSES } from '@/lib/subscription-status';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { HeaderPlanDetails } from './header-plan-details';

/** Days left is only worth header space when the plan is close to lapsing. */
const EXPIRY_WARNING_DAYS = 7;

/**
 * The active academy's plan status. It opens a details popover instead of
 * linking to /plans, because the green upgrade button next to it already does.
 */
export function HeaderPlanBadge() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [open, setOpen] = useState(false);
  const { user } = useAuthUser();
  const canManage = canManageSubscription(user);
  const { subscription, planName, status, isTrial, daysRemaining, hasAcademy, isLoading } =
    useAcademySubscription(canManage);

  if (!canManage || !hasAcademy || isLoading) {
    return null;
  }

  const display = getSubscriptionStatusDisplay(status, isTrial);
  const statusLabel = t(display.labelKey);
  const name = planName ?? statusLabel;
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
  const popoverDetail = days && status !== 'EXPIRED' ? t('header.planDaysLeft', { days }) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-xl border border-transparent px-2 text-xs font-semibold transition-opacity hover:opacity-90 sm:max-w-[13rem] sm:px-3 sm:text-sm',
            SUBSCRIPTION_TONE_CLASSES[display.tone],
          )}
        >
          <Crown className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden truncate sm:inline">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <HeaderPlanDetails
          planName={name}
          statusLabel={statusLabel}
          detail={status === 'GRACE' ? detail : popoverDetail}
          subscription={subscription}
          onNavigate={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
