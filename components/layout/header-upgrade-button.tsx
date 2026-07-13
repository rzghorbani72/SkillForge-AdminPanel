'use client';

import Link from '@/components/ui/link';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

/**
 * Always-visible upgrade shortcut in the header for the academy manager.
 * Turns solid/urgent when the plan is expiring or expired; subtle otherwise.
 */
export function HeaderUpgradeButton() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const canManage = canManageSubscription(user);
  const { shouldShowUpgrade, isLoading } = useAcademySubscription(canManage);

  if (!canManage || isLoading) {
    return null;
  }

  return (
    <Link
      href="/plans"
      title={t('sidebar.upgradePlan')}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold transition-opacity hover:opacity-90 sm:px-3',
        shouldShowUpgrade
          ? 'bg-primary text-primary-foreground'
          : 'border border-border/60 bg-muted/50 text-foreground'
      )}
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">{t('sidebar.upgradePlan')}</span>
    </Link>
  );
}
