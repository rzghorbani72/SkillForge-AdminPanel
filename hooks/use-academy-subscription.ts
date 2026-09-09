'use client';

import { apiClient, type StructuredPlanLimits } from '@/lib/api';
import { useApiQuery } from '@/hooks/use-api-query';
import { queryKeys } from '@/lib/query/keys';
import {
  overlayPaidEnrollment,
  isStarterPlan,
  isTopPlan,
  needsPlanPurchase as computeNeedsPlanPurchase,
  shouldShowUpgradePrompt
} from '@/lib/settings-scope';
import { subscriptionNeedsLiveRefresh } from '@/lib/subscription-days';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import {
  useCurrentAcademyId,
  useHasAcademyAccess
} from '@/hooks/useCurrentAcademy';
import { useLiveSubscriptionDays } from '@/hooks/use-live-subscription-days';
import type { TrialContext } from '@/components/plans/trial-move-card';

export interface AcademySubscriptionInvoice {
  id: number;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  starts_at: string;
  ends_at: string;
  paid_at?: string;
  created_at?: string;
  note?: string;
  net_amount?: number;
  vat_rate?: number;
  vat_amount?: number;
  discount_code?: string | null;
  discount_amount?: number | null;
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
  /** Term currently running: 1 or 3 months; null when nothing is paid. */
  period_months?: number | null;
  /** One plan at a time: re-buying the same tier only opens near expiry. */
  can_renew_now?: boolean;
  renewal_window_days?: number;
  storage?: {
    usage_gb: number;
    included_gb: number;
    percent_used?: number;
    warn_level?: 'ok' | 'warning' | 'full';
    is_upload_blocked?: boolean;
    extra_storage_gb?: number;
    addon_gb?: number;
    addon_price_toman?: number;
    overage_gb?: number;
    overage_fee_irr?: number;
  };
  invoices?: AcademySubscriptionInvoice[];
  /** Where the owner's one free-trial credit sits, and whether it can move here. */
  trial?: TrialContext | null;
}

export function useAcademySubscription(enabled = true) {
  // No academy yet (fresh manager, no store created) means there is nothing
  // to fetch a plan for: /academies/current/subscription 422s without an
  // X-Academy-ID, so skip the call entirely instead of firing and swallowing.
  const hasAcademyAccess = useHasAcademyAccess();
  // Each academy has its own plan, so switching academies must refetch. Without
  // this the panel kept showing the previous academy's plan and storage bar.
  const academyId = useCurrentAcademyId();
  // The academy list arrives one render before the selected academy, so waiting
  // for the id keeps that first render from firing a second, throwaway request.
  const canFetch = enabled && hasAcademyAccess && !!academyId;

  // Keyed by academyId so the sidebar, header, and /plans page — all mounted
  // at once — share one deduped request instead of firing three independently.
  const { data, isLoading, refresh } = useApiQuery<AcademySubscriptionState>({
    queryKey: queryKeys.subscription(academyId),
    queryFn: (signal) =>
      apiClient.getCurrentAcademySubscription({
        signal
      }) as Promise<AcademySubscriptionState>,
    enabled: canFetch,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const sub = query.state.data;
      if (!sub) return false;
      return subscriptionNeedsLiveRefresh({
        isTrial: sub.is_trial,
        status: sub.status,
        daysRemaining: sub.days_remaining
      })
        ? 3_600_000
        : false;
    }
  });
  const rawSubscription = data ?? null;
  const subscription = overlayPaidEnrollment(rawSubscription);

  const planSlug = subscription?.academy?.subscription_plan ?? null;
  const customPlan = subscription?.academy?.custom_plan ?? null;
  const planName =
    customPlan?.name ??
    (planSlug && planSlug !== 'none' ? getPlanDisplayName(planSlug) : null);
  const status = subscription?.status;
  const liveDaysRemaining = useLiveSubscriptionDays({
    subscriptionExpires: subscription?.academy?.subscription_expires,
    graceUntil: subscription?.grace_until,
    status
  });
  const daysRemaining =
    liveDaysRemaining ?? subscription?.days_remaining ?? null;

  return {
    subscription,
    academyId,
    isLoading,
    refresh,
    planSlug,
    planName,
    status,
    daysRemaining,
    hasAcademy: hasAcademyAccess,
    hasPaid: subscription?.has_paid ?? false,
    /** 3 when the academy bought a quarterly term, 1 otherwise. */
    periodMonths: subscription?.period_months ?? 1,
    isTrial: subscription?.is_trial ?? false,
    isStarter: isStarterPlan(planSlug),
    // Business has no higher self-serve tier — once paid and active, there is
    // nothing to upgrade to, only to renew when it's expiring.
    isTopPlan: !!customPlan || isTopPlan(planSlug),
    needsPlanPurchase:
      !!subscription &&
      computeNeedsPlanPurchase({
        hasAcademy: hasAcademyAccess,
        planSlug,
        status,
        hasPaid: subscription.has_paid
      }),
    shouldShowUpgrade:
      !customPlan && shouldShowUpgradePrompt(status, daysRemaining, planSlug)
  };
}
