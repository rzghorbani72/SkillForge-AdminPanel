'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n/hooks';
import { PlansTabScopeHeader } from '@/components/plans/plans-tab-scope-header';
import { AcademyPricingCopyCard } from '@/components/plans/academy-pricing-copy-card';
import { SubscriptionPlanData, type BillingPeriod } from '@/components/plans/plan-types';
import { SubscriptionTabContent } from './subscription-tab-content';
import type { Dispatch, SetStateAction, JSX } from 'react';
import { Academy } from '@/types/api';

export function ManagerPlansTabs({
  academyPlansPanel,
  canManagePlan,
  canRenewNow,
  currentPeriod,
  currentPlan,
  currentSub,
  fetchAcademyPlans,
  handleBuyStorageAddon,
  hasActivePaidPlan,
  isBuyingAddon,
  managerTab,
  openSelectPlan,
  period,
  plans,
  popularIndex,
  refreshPlansAndSubscription,
  renewalWindowDays,
  selectedAcademy,
  selectedCardSlug,
  setIsContactOpen,
  setManagerTab,
  setPeriod,
  setSelectedCardSlug,
  upgradeQuotes,
}: {
  academyPlansPanel: JSX.Element;
  canManagePlan: boolean;
  canRenewNow: boolean;
  currentPeriod: BillingPeriod;
  currentPlan: SubscriptionPlanData | null | undefined;
  currentSub: any;
  fetchAcademyPlans: () => Promise<void>;
  handleBuyStorageAddon: () => Promise<void>;
  hasActivePaidPlan: boolean;
  isBuyingAddon: boolean;
  managerTab: 'subscription' | 'academy';
  openSelectPlan: (plan: SubscriptionPlanData) => void;
  period: BillingPeriod;
  plans: SubscriptionPlanData[];
  popularIndex: number;
  refreshPlansAndSubscription: () => Promise<void>;
  renewalWindowDays: any;
  selectedAcademy: Academy | null;
  selectedCardSlug: string | null;
  setIsContactOpen: Dispatch<SetStateAction<boolean>>;
  setManagerTab: Dispatch<SetStateAction<'subscription' | 'academy'>>;
  setPeriod: Dispatch<SetStateAction<BillingPeriod>>;
  setSelectedCardSlug: Dispatch<SetStateAction<string | null>>;
  upgradeQuotes: any;
}) {
  const { t } = useTranslation();
  return (
    <Tabs
      value={managerTab}
      onValueChange={(v) => {
        const next = v as 'subscription' | 'academy';
        setManagerTab(next);
        if (next === 'academy') fetchAcademyPlans();
      }}
    >
      <TabsList>
        <TabsTrigger value="subscription">{t('plans.mySubscriptionTab')}</TabsTrigger>
        <TabsTrigger value="academy">{t('plans.academyPlansTab')}</TabsTrigger>
      </TabsList>

      <SubscriptionTabContent
        canManagePlan={canManagePlan}
        canRenewNow={canRenewNow}
        currentPeriod={currentPeriod}
        currentPlan={currentPlan}
        currentSub={currentSub}
        handleBuyStorageAddon={handleBuyStorageAddon}
        hasActivePaidPlan={hasActivePaidPlan}
        isBuyingAddon={isBuyingAddon}
        openSelectPlan={openSelectPlan}
        period={period}
        plans={plans}
        popularIndex={popularIndex}
        refreshPlansAndSubscription={refreshPlansAndSubscription}
        renewalWindowDays={renewalWindowDays}
        selectedAcademy={selectedAcademy}
        selectedCardSlug={selectedCardSlug}
        setIsContactOpen={setIsContactOpen}
        setPeriod={setPeriod}
        setSelectedCardSlug={setSelectedCardSlug}
        upgradeQuotes={upgradeQuotes}
      />

      <TabsContent value="academy" className="space-y-6 pt-4">
        <PlansTabScopeHeader
          scope="academy"
          title={t('plans.academyTabTitle')}
          description={t('plans.academyTabDescription')}
        />
        {academyPlansPanel}
        <AcademyPricingCopyCard canManage={canManagePlan} t={t} />
      </TabsContent>
    </Tabs>
  );
}
