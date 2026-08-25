'use client';

import Link from '@/components/ui/link';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import { Clock3 } from 'lucide-react';

export function HeaderTrialBadge() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { user } = useAuthUser();
  const canManage = canManageSubscription(user);
  const { isTrial, status, daysRemaining, isLoading } =
    useAcademySubscription(canManage);

  if (!canManage || isLoading || !isTrial) {
    return null;
  }

  if (status !== 'ACTIVE' && status !== 'GRACE') {
    return null;
  }

  if (daysRemaining == null) {
    return null;
  }

  const urgent = status === 'GRACE' || daysRemaining <= 3;
  const label =
    status === 'GRACE'
      ? t('header.trialGraceDays', { days: formatNumber(daysRemaining) })
      : t('header.trialDaysLeft', { days: formatNumber(daysRemaining) });

  return (
    <Link
      href="/plans"
      title={label}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition-opacity hover:opacity-90 sm:max-w-[11rem] sm:px-3 sm:text-sm',
        urgent
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200'
          : 'border-brandGreen/30 bg-brandGreen/10 text-brandGreen'
      )}
    >
      <Clock3 className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden truncate sm:inline">{label}</span>
    </Link>
  );
}
