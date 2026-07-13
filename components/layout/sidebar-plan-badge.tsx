'use client';

import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

/**
 * Shows the academy's current active plan under its name in the sidebar header.
 * Any academy staff can read the subscription, so no role gate is needed.
 */
export function SidebarPlanBadge() {
  const { t } = useTranslation();
  const { planName, status, isLoading } = useAcademySubscription(true);

  if (isLoading) {
    return null;
  }

  const isExpired = status === 'EXPIRED' || status === 'INACTIVE';
  const label = isExpired
    ? t('sidebar.planBadgeExpired')
    : (planName ?? t('sidebar.planBadgeFree'));

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none',
        isExpired
          ? 'bg-destructive/10 text-destructive'
          : 'bg-primary/10 text-primary'
      )}
    >
      {label}
    </span>
  );
}
