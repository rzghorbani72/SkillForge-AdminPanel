'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/ui/link';
import { Check, Crown, Loader2, Zap } from 'lucide-react';
import { apiClient, type SubscriptionPlanData } from '@/lib/api';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import {
  type BillingPeriod,
  formatPrice,
  formatStorage,
  periodPrice,
  planFeatureList,
  priceWithVat,
  vatAmount
} from '@/components/plans/plan-types';

export function BuyPlansSection() {
  const { t } = useTranslation();
  const { planSlug, status } = useAcademySubscription();
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const currentSlug = planSlug?.trim().toLowerCase() ?? '';
  const hasActivePlan =
    (status === 'ACTIVE' || status === 'GRACE') &&
    currentSlug.length > 0 &&
    currentSlug !== 'none';

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getActivePlans().catch(() => []);
        if (!cancelled) {
          setPlans(Array.isArray(data) ? data : []);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const popularIndex = Math.floor(plans.length / 2);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          {t('dashboard.buyPlanTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('dashboard.buyPlanDesc')}
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1">
          {(['monthly', 'quarterly'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
                period === p
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(`plans.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border bg-card py-12 text-center text-sm text-muted-foreground">
          {t('plans.noPlanConfigured')}
        </div>
      ) : (
        <div
          dir="rtl"
          className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {plans.map((plan, i) => {
            const isCurrent =
              hasActivePlan && plan.slug.toLowerCase() === currentSlug;
            const isPopular =
              !isCurrent && i === popularIndex && plans.length >= 2;
            const price = periodPrice(plan, period);
            const vatRate = plan.vat_rate ?? 0;
            const vat = vatAmount(price, vatRate);
            const total = priceWithVat(price, vatRate);
            const features = planFeatureList(plan.slug, plan.features).slice(
              0,
              4
            );
            return (
              <Link
                key={plan.slug}
                href={`/plans?plan=${encodeURIComponent(plan.slug)}`}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md',
                  isCurrent &&
                    'border-success/45 bg-success/[0.04] ring-1 ring-success/25',
                  isPopular && 'border-primary ring-2 ring-primary/30'
                )}
              >
                {isCurrent ? (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-success px-3 py-1 text-[11px] font-bold text-success-foreground">
                    <Crown className="h-3 w-3" />
                    {t('plans.currentPlan')}
                  </span>
                ) : (
                  isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                      {t('plans.popular')}
                    </span>
                  )
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-3xl font-black">
                    {formatPrice(total)}
                  </span>
                  <span className="ms-2 text-sm text-muted-foreground">
                    {period === 'quarterly'
                      ? t('plans.pricePerQuarter')
                      : t('plans.pricePerMonth')}
                  </span>
                </p>
                {vat > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('plans.priceBeforeVat', { price: formatPrice(price) })}
                    {' + '}
                    {t('plans.vatIncluded', {
                      percent: Math.round(vatRate * 100)
                    })}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatStorage(plan.storage_limit_gb)} {t('plans.storage')}
                </p>
                {features.length > 0 && (
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-foreground/80">
                    {features.map((feature, fi) => (
                      <li key={fi}>{feature}</li>
                    ))}
                  </ul>
                )}
                <span
                  className={cn(
                    'mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold',
                    isCurrent
                      ? 'bg-success/10 text-success'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  {isCurrent ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t('plans.currentPlan')}
                    </>
                  ) : (
                    t('dashboard.buyPlanCta')
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <Link
          href="/plans"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <Zap className="h-3.5 w-3.5" />
          {t('sidebar.upgradeButton')}
        </Link>
      </p>
    </section>
  );
}
