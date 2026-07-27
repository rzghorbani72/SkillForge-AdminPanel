'use client';

import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import {
  getSubscriptionStatusDisplay,
  SUBSCRIPTION_TONE_CLASSES
} from '@/lib/subscription-status';

/**
 * Shows the academy's current plan / subscription state under its name in the
 * sidebar header. Any academy staff can read the subscription, so no role gate.
 */
export function SidebarPlanBadge() {
  const { t } = useTranslation();
  const { planName, status, isTrial, isLoading } = useAcademySubscription(true);

  if (isLoading) {
    return null;
  }

  const display = getSubscriptionStatusDisplay(status, isTrial);
  // On a live plan we show the plan name; otherwise the state itself (e.g. "no
  // active plan") so a never-started academy no longer reads as "expired".
  const label =
    display.tone === 'active' || display.tone === 'trial'
      ? (planName ?? t('sidebar.planBadgeFree'))
      : t(display.labelKey);

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none',
        SUBSCRIPTION_TONE_CLASSES[display.tone]
      )}
    >
      {label}
    </span>
  );
}
