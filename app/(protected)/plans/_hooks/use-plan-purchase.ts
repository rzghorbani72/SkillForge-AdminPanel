'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import type { AcademyUpgradeQuote } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  SubscriptionPlanData,
  monthsForPeriod,
  periodPrice,
  type BillingPeriod,
} from '@/components/plans/plan-types';
import type { PaymentGatewayProvider } from '@/types/api';
import { paymentGatewayCallbackUrl } from '@/lib/payment-callback-url';

/**
 * Used for the first "probe" call before the backend names the live rail.
 * Saman is the default preferred gateway; the backend rewrites the callback
 * path if the owner has BitPay active instead.
 */
export const DEFAULT_GATEWAY: PaymentGatewayProvider = 'SAMAN_SEP';

export function usePlanPurchase({
  currentPeriod,
  currentPlan,
  currentSub,
  hasActivePaidPlan,
  period,
  refreshPlansAndSubscription,
}: {
  currentPeriod: BillingPeriod;
  currentPlan: SubscriptionPlanData | null | undefined;
  currentSub: any;
  hasActivePaidPlan: boolean;
  period: BillingPeriod;
  refreshPlansAndSubscription: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [selectingPlan, setSelectingPlan] = useState<SubscriptionPlanData | null>(null);

  const [selectedMonths, setSelectedMonths] = useState<number>(1);

  const [includeStorageAddon, setIncludeStorageAddon] = useState(false);

  const [isBuyingAddon, setIsBuyingAddon] = useState(false);

  const [isChanging, setIsChanging] = useState(false);

  const [upgradeQuote, setUpgradeQuote] = useState<AcademyUpgradeQuote | null>(null);

  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayProvider | null>(null);

  const [availableGateways, setAvailableGateways] = useState<
    Array<{ provider: string; display_name: string }>
  >([]);

  const [needsGatewaySelection, setNeedsGatewaySelection] = useState(false);

  const [voucherCode, setVoucherCode] = useState('');

  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    couponType: string;
  } | null>(null);

  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  function openSelectPlan(plan: SubscriptionPlanData) {
    setSelectingPlan(plan);
    setSelectedMonths(monthsForPeriod(period));
    setIncludeStorageAddon(false);
    setSelectedGateway(null);
    setAvailableGateways([]);
    setNeedsGatewaySelection(false);
    setUpgradeQuote(null);
    setVoucherCode('');
    setAppliedVoucher(null);

    // Upgrading from an active paid plan to a higher tier is a prorated diff,
    // not a full purchase — fetch the quote so the dialog can show it.
    const isUpgrade =
      hasActivePaidPlan &&
      period === currentPeriod &&
      !!currentPlan &&
      plan.sort_order > currentPlan.sort_order;
    if (isUpgrade) void loadUpgradeQuote(plan.slug);
  }

  async function loadUpgradeQuote(planSlug: string) {
    try {
      setIsQuoteLoading(true);
      setUpgradeQuote(await apiClient.getAcademyUpgradeQuote(planSlug));
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsQuoteLoading(false);
    }
  }

  function computePayableAmount(): number {
    if (!selectingPlan) return 0;
    if (upgradeQuote) {
      return upgradeQuote.amount_toman;
    }
    const basePlanPrice = periodPrice(
      selectingPlan,
      selectedMonths === 3 ? 'quarterly' : 'monthly',
    );
    const storagePrice =
      includeStorageAddon && currentSub?.storage?.addon_price_toman != null
        ? currentSub.storage.addon_price_toman
        : 0;
    return basePlanPrice + storagePrice;
  }

  async function handleApplyVoucher() {
    const code = voucherCode.trim();
    if (!code) return;
    const currentAmount = computePayableAmount();
    try {
      setIsValidatingVoucher(true);
      const res = await apiClient.validateDiscount(code, currentAmount, undefined, {
        academy_id: null,
      });
      if (res && typeof res === 'object') {
        const discountAmount = Number(res.discount_amount ?? 0);
        const finalAmount = Number(res.final_amount ?? Math.max(0, currentAmount - discountAmount));
        setAppliedVoucher({
          code: res.discount_code ?? code.toUpperCase(),
          discountAmount,
          finalAmount,
          couponType: res.coupon_type ?? 'PERCENTAGE',
        });
        toast.success(t('plans.voucherApplied'));
      }
    } catch (e) {
      setAppliedVoucher(null);
      ErrorHandler.handleApiError(e);
    } finally {
      setIsValidatingVoucher(false);
    }
  }

  function handleRemoveVoucher() {
    setAppliedVoucher(null);
    setVoucherCode('');
  }

  async function handleBuyStorageAddon() {
    try {
      setIsBuyingAddon(true);
      let provider = selectedGateway;
      if (!provider) {
        const probe = await apiClient.purchaseStorageAddon({
          callback_url: paymentGatewayCallbackUrl(DEFAULT_GATEWAY),
        });
        if (probe.redirect_url) {
          window.location.href = probe.redirect_url;
          return;
        }
        if (probe.needs_gateway_selection && probe.available_gateways?.length) {
          setAvailableGateways(probe.available_gateways);
          if (probe.available_gateways.length === 1) {
            provider = probe.available_gateways[0].provider as PaymentGatewayProvider;
            setSelectedGateway(provider);
          } else {
            setNeedsGatewaySelection(true);
            toast.info(t('plans.selectGateway'));
            return;
          }
        }
      }
      if (!provider) {
        setNeedsGatewaySelection(true);
        toast.info(t('plans.selectGateway'));
        return;
      }
      const result = await apiClient.purchaseStorageAddon({
        provider,
        callback_url: paymentGatewayCallbackUrl(provider),
      });
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }
      toast.success(t('plans.paymentSuccess'));
      await refreshPlansAndSubscription();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsBuyingAddon(false);
    }
  }

  async function handleChangePlan() {
    if (!selectingPlan) return;

    const coupon_code = appliedVoucher?.code || voucherCode.trim() || undefined;

    // Upgrade path: charge only the prorated diff, keeping the current
    // expiry. When money is owed this goes through the same gateway checkout
    // as a renewal below — the plan only switches once that payment verifies,
    // never on confirm, so a manager can't end up on a higher plan for free.
    if (upgradeQuote) {
      try {
        setIsChanging(true);

        let provider = selectedGateway;
        if (!provider) {
          const probe = await apiClient.upgradeCurrentAcademyPlan(selectingPlan.slug, {
            callback_url: paymentGatewayCallbackUrl(DEFAULT_GATEWAY),
            coupon_code,
          });

          if (probe.redirect_url) {
            window.location.href = probe.redirect_url;
            return;
          }

          if (probe.needs_gateway_selection && probe.available_gateways?.length) {
            setAvailableGateways(probe.available_gateways);
            if (probe.available_gateways.length === 1) {
              provider = probe.available_gateways[0].provider as PaymentGatewayProvider;
              setSelectedGateway(provider);
            } else {
              setNeedsGatewaySelection(true);
              return;
            }
          } else {
            // Zero-cost plan change (downgrade, voucher, or storage credit)
            toast.success(t('plans.paymentSuccess'));
            setSelectingPlan(null);
            setUpgradeQuote(null);
            setNeedsGatewaySelection(false);
            setAvailableGateways([]);
            setVoucherCode('');
            setAppliedVoucher(null);
            await refreshPlansAndSubscription();
            return;
          }
        }

        if (!provider) {
          setNeedsGatewaySelection(true);
          return;
        }

        const result = await apiClient.upgradeCurrentAcademyPlan(selectingPlan.slug, {
          provider,
          callback_url: paymentGatewayCallbackUrl(provider),
          coupon_code,
        });

        if (result.needs_gateway_selection && result.available_gateways) {
          setNeedsGatewaySelection(true);
          setAvailableGateways(result.available_gateways);
          return;
        }

        if (result.redirect_url) {
          window.location.href = result.redirect_url;
          return;
        }

        toast.success(t('plans.paymentSuccess'));
        setSelectingPlan(null);
        setUpgradeQuote(null);
        setNeedsGatewaySelection(false);
        setAvailableGateways([]);
        setVoucherCode('');
        setAppliedVoucher(null);
        await refreshPlansAndSubscription();
      } catch (e) {
        ErrorHandler.handleApiError(e);
      } finally {
        setIsChanging(false);
      }
      return;
    }

    try {
      setIsChanging(true);

      let provider = selectedGateway;
      if (!provider) {
        const probe = await apiClient.renewCurrentAcademySubscription({
          plan_name: selectingPlan.slug,
          months: selectedMonths,
          amount: periodPrice(selectingPlan, selectedMonths === 3 ? 'quarterly' : 'monthly'),
          storage_addon: includeStorageAddon ? 1 : 0,
          callback_url: paymentGatewayCallbackUrl(DEFAULT_GATEWAY),
          coupon_code,
        });

        if (probe.redirect_url) {
          window.location.href = probe.redirect_url;
          return;
        }

        if (probe.needs_gateway_selection && probe.available_gateways?.length) {
          setAvailableGateways(probe.available_gateways);
          if (probe.available_gateways.length === 1) {
            provider = probe.available_gateways[0].provider as PaymentGatewayProvider;
            setSelectedGateway(provider);
          } else {
            setNeedsGatewaySelection(true);
            return;
          }
        } else {
          // Manual / zero-amount renew — already activated
          toast.success(t('plans.paymentSuccess'));
          setSelectingPlan(null);
          setNeedsGatewaySelection(false);
          setAvailableGateways([]);
          setVoucherCode('');
          setAppliedVoucher(null);
          await refreshPlansAndSubscription();
          return;
        }
      }

      if (!provider) {
        setNeedsGatewaySelection(true);
        return;
      }

      const result = await apiClient.renewCurrentAcademySubscription({
        plan_name: selectingPlan.slug,
        months: selectedMonths,
        amount: periodPrice(selectingPlan, selectedMonths === 3 ? 'quarterly' : 'monthly'),
        storage_addon: includeStorageAddon ? 1 : 0,
        provider,
        callback_url: paymentGatewayCallbackUrl(provider),
        coupon_code,
      });

      if (result.needs_gateway_selection && result.available_gateways) {
        setNeedsGatewaySelection(true);
        setAvailableGateways(result.available_gateways);
        return;
      }

      if (result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }

      toast.success(t('plans.paymentSuccess'));
      setSelectingPlan(null);
      setNeedsGatewaySelection(false);
      setAvailableGateways([]);
      setVoucherCode('');
      setAppliedVoucher(null);
      await refreshPlansAndSubscription();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsChanging(false);
    }
  }

  return {
    appliedVoucher,
    availableGateways,
    handleApplyVoucher,
    handleBuyStorageAddon,
    handleChangePlan,
    handleRemoveVoucher,
    includeStorageAddon,
    isBuyingAddon,
    isChanging,
    isQuoteLoading,
    isValidatingVoucher,
    needsGatewaySelection,
    openSelectPlan,
    selectedGateway,
    selectedMonths,
    selectingPlan,
    setAppliedVoucher,
    setIncludeStorageAddon,
    setSelectedGateway,
    setSelectedMonths,
    setSelectingPlan,
    setVoucherCode,
    upgradeQuote,
    voucherCode,
  };
}
