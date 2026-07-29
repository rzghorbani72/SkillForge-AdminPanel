'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient, type StructuredPlanLimits } from '@/lib/api';
import {
  isStarterPlan,
  isTopPlan,
  shouldShowUpgradePrompt
} from '@/lib/settings-scope';
import { getPlanDisplayName } from '@/lib/plan-display-name';

export interface AcademySubscriptionInvoice {
  id: number;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  starts_at: string;
  ends_at: string;
  paid_at?: string;
  note?: string;
}

export interface AcademySubscriptionState {
  academy?: {
    id: number;
    name: string;
    subscription_plan?: string | null;
    subscription_expires?: string | null;
    custom_plan?: {
      name: string | null;
      limits: StructuredPlanLimits;
      features: string[];
    } | null;
  };
  status?: 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'INACTIVE';
  days_remaining?: number | null;
  grace_until?: string | null;
  // A free trial is ACTIVE but not paid; only a truly paid plan can be upgraded
  // (prorated). Trial and no-plan both buy at full price.
  is_trial?: boolean;
  has_paid?: boolean;
  storage?: {
    usage_gb: number;
    included_gb: number;
    overage_gb: number;
    overage_fee_irr: number;
  };
  invoices?: AcademySubscriptionInvoice[];
}

export function useAcademySubscription(enabled = true) {
  const [subscription, setSubscription] =
    useState<AcademySubscriptionState | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      setIsLoading(true);
      const data = await apiClient.getCurrentAcademySubscription();
      setSubscription((data as AcademySubscriptionState) ?? null);
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const planSlug = subscription?.academy?.subscription_plan ?? null;
  const customPlan = subscription?.academy?.custom_plan ?? null;
  const planName =
    customPlan?.name ??
    (planSlug && planSlug !== 'none' ? getPlanDisplayName(planSlug) : null);
  const status = subscription?.status;
  const daysRemaining = subscription?.days_remaining ?? null;

  return {
    subscription,
    isLoading,
    refresh,
    planSlug,
    planName,
    status,
    daysRemaining,
    isTrial: subscription?.is_trial ?? false,
    isStarter: isStarterPlan(planSlug),
    // Business has no higher self-serve tier — once paid and active, there is
    // nothing to upgrade to, only to renew when it's expiring.
    isTopPlan: !!customPlan || isTopPlan(planSlug),
    shouldShowUpgrade:
      !customPlan && shouldShowUpgradePrompt(status, daysRemaining, planSlug)
  };
}
