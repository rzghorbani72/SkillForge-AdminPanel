'use client';

import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import {
  getSubscriptionStatusDisplay,
  SUBSCRIPTION_TONE_CLASSES
} from '@/lib/subscription-status';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

/**
 * The subscription belongs to the manager, not to a single academy — one plan
 * covers every academy they own. So it is shown once, above the cards, instead
 * of being repeated (and misread) on each academy card.
 */
export function CurrentPlanBanner() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const canManage = canManageSubscription(user);
  const { planName, status, isTrial, isLoading } =
    useAcademySubscription(canManage);

  if (!canManage) return null;
  if (isLoading) return <Skeleton className="h-20 w-full rounded-2xl" />;

  const display = getSubscriptionStatusDisplay(status, isTrial);
  const hasLivePlan = display.tone === 'active' || display.tone === 'trial';

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {t('stores.currentPlan')}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-base font-semibold">
              {hasLivePlan && planName ? planName : t('stores.noActivePlan')}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none',
                SUBSCRIPTION_TONE_CLASSES[display.tone]
              )}
            >
              {t(display.labelKey)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('stores.planCoversAllAcademies')}
          </p>
        </div>
      </div>

      <Button asChild size="sm" className="rounded-xl">
        <Link href="/plans">
          {t('stores.upgradePlan')}
          <ArrowLeft className="ms-1.5 h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
