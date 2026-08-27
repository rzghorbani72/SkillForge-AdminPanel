'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/ui/link';
import { Loader2, Zap } from 'lucide-react';
import { apiClient, type SubscriptionPlanData } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import {
  type BillingPeriod,
  formatPrice,
  formatStorage,
  periodPrice,
  planFeatureList
} from '@/components/plans/plan-types';

export function BuyPlansSection() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<BillingPeriod>('monthly');

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
            const isPopular = i === popularIndex && plans.length >= 2;
            const price = periodPrice(plan, period);
            const features = planFeatureList(plan.slug, plan.features).slice(
              0,
              4
            );
            return (
              <Link
                key={plan.id}
                href={`/plans?plan=${encodeURIComponent(plan.slug)}`}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md',
                  isPopular && 'border-primary ring-2 ring-primary/30'
                )}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                    {t('plans.popular')}
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-3xl font-black">
                    {formatPrice(price)}
                  </span>
                  <span className="ms-2 text-sm text-muted-foreground">
                    {period === 'quarterly'
                      ? t('plans.pricePerQuarter')
                      : t('plans.pricePerMonth')}
                  </span>
                </p>
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
                <span className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  {t('dashboard.buyPlanCta')}
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
