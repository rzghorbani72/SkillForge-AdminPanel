'use client';

import Link from '@/components/ui/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Zap } from 'lucide-react';
import { ScopeBadge } from '@/components/settings/scope-badge';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { shouldHideUpgradeCard } from '@/lib/settings-scope';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';

export function SubscriptionStatusCard() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const isManager = user?.role === 'MANAGER';
  const {
    planName,
    status,
    daysRemaining,
    planSlug,
    isTopPlan,
    shouldShowUpgrade,
    isLoading
  } = useAcademySubscription(isManager);

  if (!isManager) return null;

  if (!isLoading && shouldHideUpgradeCard(status, daysRemaining, planSlug)) {
    return null;
  }

  // Business has no higher tier: paid + active means nothing to upgrade to,
  // so the card only earns its place back when a renewal is actually due.
  if (!isLoading && isTopPlan && !shouldShowUpgrade) {
    return null;
  }

  const title = isTopPlan
    ? t('dashboard.renewPlanTitle')
    : t('dashboard.upgradePlanTitle');
  const description = isTopPlan
    ? t('dashboard.renewPlanDesc')
    : t('dashboard.upgradePlanDesc');

  return (
    <Card className="border-violet-200/70 bg-gradient-to-r from-violet-50/80 to-background dark:border-violet-900/50 dark:from-violet-950/30">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-violet-600" />
            {title}
          </CardTitle>
          <ScopeBadge scope="platform" showTooltip={false} />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        {isLoading ? (
          <Skeleton className="h-4 w-48" />
        ) : (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium capitalize text-foreground">
              {planName ?? t('settings.noPlan')}
            </span>
            {daysRemaining != null ? (
              <span>
                {' '}
                · {t('settings.daysRemaining')}: {daysRemaining}
              </span>
            ) : null}
          </div>
        )}
        <Button asChild size="sm">
          <Link href="/plans" className="inline-flex items-center gap-2">
            {t('dashboard.upgradePlanCta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
