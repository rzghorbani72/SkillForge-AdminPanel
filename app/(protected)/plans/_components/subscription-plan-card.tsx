'use client';

import { Check, Lock, Crown, Clock3 } from 'lucide-react';
import type { AcademyUpgradeQuote } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  SubscriptionPlanData,
  formatPrice,
  planFeatureList,
  type BillingPeriod,
  quarterlyDiscount,
} from '@/components/plans/plan-types';

export function SubscriptionPlanCard({
  plan,
  isRecommended,
  isSelected,
  isCurrent,
  isExtend,
  isLocked,
  canRenew,
  renewalWindowDays,
  price,
  period,
  daysRemaining,
  upgradeQuote,
  canSelect,
  onCardSelect,
  onSelect,
  t,
}: {
  plan: SubscriptionPlanData;
  isRecommended: boolean;
  isSelected: boolean;
  isCurrent: boolean;
  /** Same plan, other term — buying it extends the subscription. */
  isExtend: boolean;
  isLocked: boolean;
  /** Same plan, and the running term is close enough to its end to re-buy. */
  canRenew: boolean;
  renewalWindowDays: number;
  price: number;
  period: BillingPeriod;
  /** Days left on the running term — shown on the active card only. */
  daysRemaining: number | null;
  /** Set only while a paid plan is running: the prorated cost to switch here. */
  upgradeQuote: AcademyUpgradeQuote | null;
  canSelect: boolean;
  onCardSelect: () => void;
  onSelect: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const features = planFeatureList(plan.slug, plan.features);
  const qDiscount = period === 'quarterly' ? quarterlyDiscount(plan.price_monthly) : null;

  return (
    <div
      dir="rtl"
      onClick={onCardSelect}
      className={cn(
        'relative flex h-full cursor-pointer flex-col rounded-2xl border bg-card p-8 transition-all duration-200',
        // The plan they are ON reads as owned, not as an offer: it keeps the
        // success tone of the header badge instead of the primary buy accent.
        isCurrent
          ? 'border-success/45 bg-success/[0.04] shadow-sm ring-1 ring-success/25'
          : isSelected
            ? 'border-primary shadow-md ring-2 ring-primary/40'
            : 'border-border hover:border-primary/40 hover:shadow-md',
      )}
    >
      {isCurrent ? (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-success px-3 py-1 text-[11px] font-bold text-success-foreground shadow">
          <Crown className="h-3 w-3" />
          {t('plans.currentPlan')}
        </span>
      ) : (
        isRecommended && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow">
            {t('plans.popular')}
          </span>
        )
      )}

      <h2 className="text-center text-lg font-bold text-foreground">{plan.name}</h2>
      <p className="mt-1.5 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {plan.slug}
      </p>

      {/* The headline is what this manager actually pays next: the prorated
          upgrade difference while a paid plan runs, the full price otherwise. */}
      {upgradeQuote ? (
        <div className="mt-6 text-center">
          <p>
            <span className="text-[34px] font-black leading-none text-primary">
              {upgradeQuote.amount_toman > 0
                ? formatPrice(upgradeQuote.amount_toman)
                : t('plans.upgradeFree')}
            </span>
            {upgradeQuote.amount_toman > 0 && (
              <span className="ms-2 text-[13px] text-muted-foreground">{t('plans.toman')}</span>
            )}
          </p>
          <p className="mt-1.5 text-[12px] font-semibold text-primary/80">
            {t('plans.upgradeCostLabel', {
              days: formatPrice(upgradeQuote.remainingDays),
            })}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {t(
              upgradeQuote.periodMonths === 3
                ? 'plans.upgradeThenFullQuarterly'
                : 'plans.upgradeThenFullMonthly',
              {
                price: formatPrice(upgradeQuote.target_plan.price_period_toman),
              },
            )}
          </p>
        </div>
      ) : (
        <p className="mt-6 text-center">
          <span className="text-[34px] font-black leading-none text-foreground">
            {formatPrice(price)}
          </span>
          <span className="ms-2 text-[13px] text-muted-foreground">
            {period === 'quarterly' ? t('plans.pricePerQuarter') : t('plans.pricePerMonth')}
          </span>
        </p>
      )}

      {isCurrent && daysRemaining != null && (
        <p className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[12px] font-semibold text-success">
            <Clock3 className="h-3.5 w-3.5" />
            {t('header.planDaysLeft', { days: formatPrice(daysRemaining) })}
          </span>
        </p>
      )}

      {isExtend && (
        <p className="mt-2 text-center text-[12px] text-muted-foreground">
          {t('plans.extendHint')}
        </p>
      )}

      {period === 'quarterly' && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[12px]">
          {qDiscount && qDiscount.amount > 0 ? (
            <>
              <span className="text-muted-foreground line-through">
                {t('plans.quarterlyWas', {
                  price: formatPrice(qDiscount.full),
                })}
              </span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 font-semibold text-success">
                {t('plans.quarterlyDiscount', { percent: qDiscount.percent })}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">
              {t('plans.equivalentPerMonth', {
                price: formatPrice(Math.round(price / 3)),
              })}
            </span>
          )}
        </div>
      )}

      {features.length > 0 && (
        <ul className="mt-7 flex flex-1 flex-col gap-3.5">
          {features.map((feature, fi) => (
            <li
              key={fi}
              className="flex items-start gap-2.5 text-[13.5px] leading-[1.7] text-foreground/80"
            >
              <Check size={15} strokeWidth={3} aria-hidden className="mt-1 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {canSelect && (
        <button
          type="button"
          disabled={(isCurrent && !canRenew) || isLocked}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          title={
            isLocked
              ? isExtend
                ? t('plans.renewOpensLater', { days: renewalWindowDays })
                : t('plans.lockedUntilCurrentEnds')
              : undefined
          }
          className={cn(
            'mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-150',
            isCurrent && !canRenew
              ? 'cursor-default bg-success/10 text-success'
              : isLocked
                ? 'cursor-not-allowed border border-border bg-muted/40 text-muted-foreground'
                : isSelected
                  ? 'bg-primary text-primary-foreground hover:-translate-y-0.5 active:scale-[0.99]'
                  : 'border border-border bg-muted/40 text-foreground hover:border-primary/40',
          )}
        >
          {isCurrent && !canRenew ? (
            <>
              <Check className="h-4 w-4" />
              {t('plans.currentPlan')}
            </>
          ) : isLocked ? (
            <>
              <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" />
              {/* Short label keeps the button one line; the full sentence
                  stays in the tooltip. */}
              <span className="truncate text-[13px] font-semibold">
                {isExtend ? t('plans.renewLockedShort') : t('plans.lockedShort')}
              </span>
            </>
          ) : isExtend || canRenew ? (
            t('plans.extendPlan')
          ) : (
            t('plans.choosePlan')
          )}
        </button>
      )}
    </div>
  );
}
