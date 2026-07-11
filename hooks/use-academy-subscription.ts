'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { isStarterPlan, shouldShowUpgradePrompt } from '@/lib/settings-scope';

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
  };
  status?: 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'INACTIVE';
  days_remaining?: number | null;
  grace_until?: string | null;
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
  const planName = planSlug && planSlug !== 'none' ? planSlug : null;
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
    isStarter: isStarterPlan(planSlug),
    shouldShowUpgrade: shouldShowUpgradePrompt(status, daysRemaining, planSlug)
  };
}
