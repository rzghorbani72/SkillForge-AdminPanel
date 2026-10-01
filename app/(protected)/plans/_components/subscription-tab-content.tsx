'use client';

import { TabsContent } from '@/components/ui/tabs';
import { Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { PlansTabScopeHeader } from '@/components/plans/plans-tab-scope-header';
import { TrialMoveCard } from '@/components/plans/trial-move-card';
import {
  SubscriptionPlanData,
  periodPrice,
  type BillingPeriod,
} from '@/components/plans/plan-types';
import { BillingPeriodToggle } from './billing-period-toggle';
import { CurrentSubscriptionBanner } from './current-subscription-banner';
import { EnterprisePlanCard } from './enterprise-plan-card';
import { SubscriptionPlanCard } from './subscription-plan-card';
import type { Dispatch, SetStateAction } from 'react';
import { Academy } from '@/types/api';

export function SubscriptionTabContent({
  canManagePlan,
  canRenewNow,
  currentPeriod,
  currentPlan,
  currentSub,
  handleBuyStorageAddon,
  hasActivePaidPlan,
  isBuyingAddon,
  openSelectPlan,
  period,
  plans,
  popularIndex,
  refreshPlansAndSubscription,
  renewalWindowDays,
  selectedAcademy,
  selectedCardSlug,
  setIsContactOpen,
  setPeriod,
  setSelectedCardSlug,
  upgradeQuotes,
}: {
  canManagePlan: boolean;
  canRenewNow: boolean;
  currentPeriod: BillingPeriod;
  currentPlan: SubscriptionPlanData | null | undefined;
  currentSub: any;
  handleBuyStorageAddon: () => Promise<void>;
  hasActivePaidPlan: boolean;
  isBuyingAddon: boolean;
  openSelectPlan: (plan: SubscriptionPlanData) => void;
  period: BillingPeriod;
  plans: SubscriptionPlanData[];
  popularIndex: number;
  refreshPlansAndSubscription: () => Promise<void>;
  renewalWindowDays: any;
  selectedAcademy: Academy | null;
  selectedCardSlug: string | null;
  setIsContactOpen: Dispatch<SetStateAction<boolean>>;
  setPeriod: Dispatch<SetStateAction<BillingPeriod>>;
  setSelectedCardSlug: Dispatch<SetStateAction<string | null>>;
  upgradeQuotes: any;
}) {
  const { t } = useTranslation();
  return (
    <TabsContent value="subscription" className="space-y-6 pt-4">
      {/* The plan is bought from the platform but belongs to THIS academy:
      a sibling academy has its own plan, storage and bill. */}
      <PlansTabScopeHeader
        scope="academy"
        title={t('plans.platformTabTitle')}
        description={t('plans.platformTabDescription')}
      />
      <CurrentSubscriptionBanner
        currentSub={currentSub}
        currentPlan={currentPlan}
        t={t}
        isBuyingAddon={isBuyingAddon}
        onBuyStorageAddon={canManagePlan ? () => void handleBuyStorageAddon() : undefined}
      />
      {selectedAcademy && (
        <TrialMoveCard
          academyId={selectedAcademy.id}
          academyName={selectedAcademy.name}
          trial={currentSub?.trial}
          hasPaid={currentSub?.has_paid === true}
          onMoved={() => void refreshPlansAndSubscription()}
        />
      )}

      <div className="flex justify-center">
        <BillingPeriodToggle period={period} setPeriod={setPeriod} t={t} />
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border bg-card py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Zap className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t('plans.noPlanConfigured')}</p>
        </div>
      ) : (
        <div
          dir="rtl"
          className="stagger-children grid items-stretch gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {plans.map((plan, i) => {
            // The "popular" nudge is for someone choosing a first plan.
            // Once the academy exists the manager is comparing against
            // what they already pay, so the badge is noise.
            const isPopular = !selectedAcademy && i === popularIndex && plans.length >= 2;
            // Only a genuinely PAID plan is "current" (locked). During a
            // free trial the academy sits on a plan it hasn't paid for, so
            // every tier — including that one — stays buyable at full price
            // to convert the trial into a paid subscription.
            const isSameTier =
              hasActivePaidPlan && (currentPlan?.slug === plan.slug || currentPlan?.id === plan.id);
            const isCurrent = isSameTier && period === currentPeriod;
            // Same tier, other term: not an upgrade and not a lock — it is
            // a renewal that extends the plan by the chosen term.
            const isExtend = isSameTier && !isCurrent;
            // Buying the running tier again is a RENEWAL, and it only opens
            // near the end of the paid term — otherwise a manager could buy
            // the same plan over and over and stack terms. The backend
            // refuses it too; this only keeps the button honest.
            const canRenew = isSameTier && canRenewNow;
            // While the current plan is actively paid, only upper
            // (higher-tier) plans can be selected for upgrade; the
            // current and lower tiers unlock once it ends.
            const isUpperPlan = currentPlan ? plan.sort_order > currentPlan.sort_order : true;
            const isLocked =
              hasActivePaidPlan && ((!isSameTier && !isUpperPlan) || (isExtend && !canRenewNow));
            const price = periodPrice(plan, period);
            return (
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                isRecommended={isPopular}
                isSelected={selectedCardSlug === plan.slug}
                isCurrent={isCurrent}
                isExtend={isExtend}
                isLocked={isLocked}
                canRenew={canRenew}
                renewalWindowDays={renewalWindowDays}
                price={price}
                period={period}
                daysRemaining={currentSub?.days_remaining ?? null}
                upgradeQuote={upgradeQuotes[plan.slug] ?? null}
                canSelect={canManagePlan}
                onCardSelect={() => setSelectedCardSlug(plan.slug)}
                onSelect={() => (!isCurrent || canRenew) && !isLocked && openSelectPlan(plan)}
                t={t}
              />
            );
          })}
          {canManagePlan && <EnterprisePlanCard onContact={() => setIsContactOpen(true)} t={t} />}
        </div>
      )}
    </TabsContent>
  );
}
