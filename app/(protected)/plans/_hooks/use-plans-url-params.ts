'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { SubscriptionPlanData } from '@/components/plans/plan-types';
import type { Dispatch, SetStateAction, RefObject } from 'react';

export function usePlansUrlParams({
  canManagePlan,
  fetchAcademyPlans,
  openSelectPlan,
  paidParam,
  paidToastShownRef,
  planParam,
  plans,
  refreshSubscription,
  setManagerTab,
  setVoucherCode,
  tabParam,
  voucherParam,
}: {
  canManagePlan: boolean;
  fetchAcademyPlans: () => Promise<void>;
  openSelectPlan: (plan: SubscriptionPlanData) => void;
  paidParam: string | null;
  paidToastShownRef: RefObject<boolean>;
  planParam: string | null;
  plans: SubscriptionPlanData[];
  refreshSubscription: any;
  setManagerTab: Dispatch<SetStateAction<'subscription' | 'academy'>>;
  setVoucherCode: Dispatch<SetStateAction<string>>;
  tabParam: string | null;
  voucherParam: string | null;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!voucherParam) return;
    setVoucherCode(voucherParam.trim().toUpperCase());
  }, [voucherParam]);

  useEffect(() => {
    if (tabParam === 'academy') {
      setManagerTab('academy');
      void fetchAcademyPlans();
    }
  }, [tabParam, fetchAcademyPlans]);

  useEffect(() => {
    if (!paidParam || paidToastShownRef.current) return;
    paidToastShownRef.current = true;
    toast.success(t('plans.paymentSuccess'), {
      toastId: 'plans-payment-success',
    });
    // The subscription query can still be within its staleTime from before the
    // payment, so force a refetch instead of trusting the cache after redirect.
    void refreshSubscription();
    // Drop ?paid without router deps (keeps this effect's dep array size stable).
    const url = new URL(window.location.href);
    url.searchParams.delete('paid');
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }, [paidParam, t, refreshSubscription]);

  const planParamHandledRef = useRef(false);

  useEffect(() => {
    if (planParamHandledRef.current) return;
    if (!planParam || !canManagePlan || plans.length === 0) return;
    const matched = plans.find((plan) => plan.slug === planParam);
    if (matched) {
      openSelectPlan(matched);
    }
    planParamHandledRef.current = true;
  }, [planParam, canManagePlan, plans]);
}
