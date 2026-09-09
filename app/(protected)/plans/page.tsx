'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Check,
  CheckCircle2,
  Lock,
  Loader2,
  Crown,
  Calendar,
  HardDrive,
  AlertTriangle,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Building2,
  Clock3
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import type { AcademyUpgradeQuote } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin } from '@/lib/roles';
import { cn } from '@/lib/utils';
import {
  useAcademySubscription,
  AcademySubscriptionState
} from '@/hooks/use-academy-subscription';
import {
  getSubscriptionStatusDisplay,
  SUBSCRIPTION_TONE_CLASSES
} from '@/lib/subscription-status';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import { PlansTabScopeHeader } from '@/components/plans/plans-tab-scope-header';
import { SubscriptionInvoicesList } from '@/components/plans/subscription-invoices-list';
import { useUpgradeQuotes } from '@/hooks/use-upgrade-quotes';
import { TrialMoveCard } from '@/components/plans/trial-move-card';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { PlanFormDialog } from '@/components/plans/PlanFormDialog';
import { AcademyPlanFormDialog } from '@/components/plans/AcademyPlanFormDialog';
import { AcademyPlansList } from '@/components/plans/AcademyPlansList';
import { AcademyPricingCopyCard } from '@/components/plans/academy-pricing-copy-card';
import {
  AcademyPlanData,
  PlanFormData,
  AcademyPlanFormData,
  SubscriptionPlanData,
  DEFAULT_PLAN_FORM,
  DEFAULT_ACADEMY_PLAN_FORM,
  PERIOD_OPTIONS,
  formatPrice,
  formatStorage,
  planFeatureList,
  monthsForPeriod,
  periodPrice,
  type BillingPeriod,
  quarterlyDiscount,
  vatAmount
} from '@/components/plans/plan-types';
import type { PaymentGatewayProvider } from '@/types/api';
import { paymentGatewayCallbackUrl } from '@/lib/payment-callback-url';

/**
 * Used for the first "probe" call, before the backend has told us which
 * gateways are enabled. BitPay is the only production rail, so a probe that
 * goes straight through lands on the right callback.
 */
const DEFAULT_GATEWAY: PaymentGatewayProvider = 'BITPAY';

export default function PlansPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const paidParam = searchParams.get('paid');
  const planParam = searchParams.get('plan');
  const periodParam = searchParams.get('period');
  const voucherParam = searchParams.get('voucher');
  // Guard against double toast: React Strict Mode remounts and `t` identity
  // changes both re-run the effect while `?paid=1` is still in the URL.
  const paidToastShownRef = useRef(false);
  const [managerTab, setManagerTab] = useState<'subscription' | 'academy'>(
    tabParam === 'academy' ? 'academy' : 'subscription'
  );

  const isPlatformAdminUser = isPlatformAdmin(user);
  const canManagePlan =
    !isPlatformAdminUser &&
    (user?.role === 'ADMIN' || user?.role === 'MANAGER');
  const isTeacher = user?.role === 'TEACHER';
  const canManageAcademyPlans = isPlatformAdminUser || canManagePlan;

  const [period, setPeriod] = useState<BillingPeriod>(
    periodParam === 'quarterly' ? 'quarterly' : 'monthly'
  );
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  // Shared with the sidebar/header via one SWR cache key — avoids firing the
  // same /academies/current/subscription request three times per page load.
  const {
    subscription: currentSub,
    isLoading: isSubLoading,
    refresh: refreshSubscription
  } = useAcademySubscription(!isPlatformAdminUser);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const isLoading = isPlansLoading || (!isPlatformAdminUser && isSubLoading);

  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanData | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<PlanFormData>(DEFAULT_PLAN_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlanData | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectingPlan, setSelectingPlan] =
    useState<SubscriptionPlanData | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [includeStorageAddon, setIncludeStorageAddon] = useState(false);
  const [isBuyingAddon, setIsBuyingAddon] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  // Present only when the selected plan is an UPGRADE (active paid plan → higher
  // tier): its presence switches the dialog from full-price purchase to the
  // prorated diff.
  const [upgradeQuote, setUpgradeQuote] = useState<AcademyUpgradeQuote | null>(
    null
  );
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] =
    useState<PaymentGatewayProvider | null>(null);
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

  const selectedAcademy = useCurrentAcademy();

  const [academyPlans, setAcademyPlans] = useState<AcademyPlanData[]>([]);
  const [isAcademyPlansLoading, setIsAcademyPlansLoading] = useState(false);
  const [editingAcademyPlan, setEditingAcademyPlan] =
    useState<AcademyPlanData | null>(null);
  const [isAcademyPlanFormOpen, setIsAcademyPlanFormOpen] = useState(false);
  const [academyPlanForm, setAcademyPlanForm] = useState<AcademyPlanFormData>(
    DEFAULT_ACADEMY_PLAN_FORM
  );
  const [isSavingAcademyPlan, setIsSavingAcademyPlan] = useState(false);
  const [deletingAcademyPlan, setDeletingAcademyPlan] =
    useState<AcademyPlanData | null>(null);
  const [isDeletingAcademyPlan, setIsDeletingAcademyPlan] = useState(false);

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      setIsPlansLoading(true);
      const plansData = isPlatformAdminUser
        ? await apiClient.getSubscriptionPlans().catch(() => [])
        : await apiClient.getActivePlans().catch(() => []);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsPlansLoading(false);
    }
  }, [isPlatformAdminUser]);

  // Plan CRUD only touches the plans list. Buying/upgrading/moving a trial
  // changes the subscription itself, so those flows must also refresh it.
  const refreshPlansAndSubscription = useCallback(async () => {
    await Promise.all([fetchSubscriptionPlans(), refreshSubscription()]);
  }, [fetchSubscriptionPlans, refreshSubscription]);

  const fetchAcademyPlans = useCallback(async () => {
    try {
      setIsAcademyPlansLoading(true);
      const data = await apiClient.getAcademyPlans().catch(() => []);
      setAcademyPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsAcademyPlansLoading(false);
    }
  }, []);

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
    fetchSubscriptionPlans();
  }, [fetchSubscriptionPlans]);

  useEffect(() => {
    if (!paidParam || paidToastShownRef.current) return;
    paidToastShownRef.current = true;
    toast.success(t('plans.paymentSuccess'), {
      toastId: 'plans-payment-success'
    });
    // The subscription query can still be within its staleTime from before the
    // payment, so force a refetch instead of trusting the cache after redirect.
    void refreshSubscription();
    // Drop ?paid without router deps (keeps this effect's dep array size stable).
    const url = new URL(window.location.href);
    url.searchParams.delete('paid');
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }, [paidParam, t, refreshSubscription]);

  // Coming from the landing page's "enroll" link: open the confirm dialog
  // pre-selected on that plan so buying it is one click away, not a re-pick.
  // Guarded by a ref (not just clearing the param) so the dialog doesn't
  // reopen if the manager closes it and the plans list re-renders.
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

  function openCreate() {
    setEditingPlan(null);
    setForm(DEFAULT_PLAN_FORM);
    setIsFormOpen(true);
  }

  function openEdit(plan: SubscriptionPlanData) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      price_monthly: String(plan.price_monthly),
      price_yearly: String(plan.price_yearly ?? ''),
      storage_limit_gb: String(plan.storage_limit_gb),
      features: (plan.features ?? []).join('\n'),
      is_active: plan.is_active,
      sort_order: String(plan.sort_order)
    });
    setIsFormOpen(true);
  }

  async function handleSavePlan() {
    try {
      setIsSaving(true);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
        price_monthly: Number(form.price_monthly),
        price_yearly: form.price_yearly ? Number(form.price_yearly) : null,
        storage_limit_gb: Number(form.storage_limit_gb),
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
        commission_rate: null
      };
      if (editingPlan) {
        await apiClient.updateSubscriptionPlan(editingPlan.id, payload);
      } else {
        await apiClient.createSubscriptionPlan(payload);
      }
      setIsFormOpen(false);
      await fetchSubscriptionPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePlan() {
    if (!deletingPlan) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteSubscriptionPlan(deletingPlan.id);
      setDeletingPlan(null);
      await fetchSubscriptionPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleTogglePlanActive(plan: SubscriptionPlanData) {
    try {
      await apiClient.updateSubscriptionPlan(plan.id, {
        is_active: !plan.is_active
      });
      await fetchSubscriptionPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  }

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
      selectedMonths === 3 ? 'quarterly' : 'monthly'
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
      const res = await apiClient.validateDiscount(
        code,
        currentAmount,
        undefined,
        { academy_id: null }
      );
      if (res && typeof res === 'object') {
        const discountAmount = Number(res.discount_amount ?? 0);
        const finalAmount = Number(
          res.final_amount ?? Math.max(0, currentAmount - discountAmount)
        );
        setAppliedVoucher({
          code: res.discount_code ?? code.toUpperCase(),
          discountAmount,
          finalAmount,
          couponType: res.coupon_type ?? 'PERCENTAGE'
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
          callback_url: paymentGatewayCallbackUrl(DEFAULT_GATEWAY)
        });
        if (probe.redirect_url) {
          window.location.href = probe.redirect_url;
          return;
        }
        if (probe.needs_gateway_selection && probe.available_gateways?.length) {
          setAvailableGateways(probe.available_gateways);
          if (probe.available_gateways.length === 1) {
            provider = probe.available_gateways[0]
              .provider as PaymentGatewayProvider;
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
        callback_url: paymentGatewayCallbackUrl(provider)
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
          const probe = await apiClient.upgradeCurrentAcademyPlan(
            selectingPlan.slug,
            {
              callback_url: paymentGatewayCallbackUrl(DEFAULT_GATEWAY),
              coupon_code
            }
          );

          if (probe.redirect_url) {
            window.location.href = probe.redirect_url;
            return;
          }

          if (
            probe.needs_gateway_selection &&
            probe.available_gateways?.length
          ) {
            setAvailableGateways(probe.available_gateways);
            if (probe.available_gateways.length === 1) {
              provider = probe.available_gateways[0]
                .provider as PaymentGatewayProvider;
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

        const result = await apiClient.upgradeCurrentAcademyPlan(
          selectingPlan.slug,
          {
            provider,
            callback_url: paymentGatewayCallbackUrl(provider),
            coupon_code
          }
        );

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
          amount: periodPrice(
            selectingPlan,
            selectedMonths === 3 ? 'quarterly' : 'monthly'
          ),
          storage_addon: includeStorageAddon ? 1 : 0,
          callback_url: paymentGatewayCallbackUrl(DEFAULT_GATEWAY),
          coupon_code
        });

        if (probe.redirect_url) {
          window.location.href = probe.redirect_url;
          return;
        }

        if (probe.needs_gateway_selection && probe.available_gateways?.length) {
          setAvailableGateways(probe.available_gateways);
          if (probe.available_gateways.length === 1) {
            provider = probe.available_gateways[0]
              .provider as PaymentGatewayProvider;
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
        amount: periodPrice(
          selectingPlan,
          selectedMonths === 3 ? 'quarterly' : 'monthly'
        ),
        storage_addon: includeStorageAddon ? 1 : 0,
        provider,
        callback_url: paymentGatewayCallbackUrl(provider),
        coupon_code
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

  function openCreateAcademyPlan() {
    setEditingAcademyPlan(null);
    setAcademyPlanForm(DEFAULT_ACADEMY_PLAN_FORM);
    setIsAcademyPlanFormOpen(true);
  }

  function openEditAcademyPlan(plan: AcademyPlanData) {
    setEditingAcademyPlan(plan);
    setAcademyPlanForm({
      kind: plan.kind,
      name: plan.name,
      description: plan.description ?? '',
      price: String(plan.price),
      duration_days:
        plan.duration_days != null ? String(plan.duration_days) : '',
      is_active: plan.is_active
    });
    setIsAcademyPlanFormOpen(true);
  }

  async function handleSaveAcademyPlan() {
    try {
      setIsSavingAcademyPlan(true);
      const dto = {
        kind: academyPlanForm.kind,
        name: academyPlanForm.name.trim(),
        description: academyPlanForm.description.trim() || undefined,
        price: Number(academyPlanForm.price),
        duration_days:
          academyPlanForm.kind === 'SUBSCRIPTION' &&
          academyPlanForm.duration_days
            ? Number(academyPlanForm.duration_days)
            : undefined
      };
      if (editingAcademyPlan) {
        await apiClient.updateAcademyPlan(editingAcademyPlan.id, {
          ...dto,
          is_active: academyPlanForm.is_active
        });
      } else {
        await apiClient.createAcademyPlan(dto);
      }
      setIsAcademyPlanFormOpen(false);
      await fetchAcademyPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSavingAcademyPlan(false);
    }
  }

  async function handleDeleteAcademyPlan() {
    if (!deletingAcademyPlan) return;
    try {
      setIsDeletingAcademyPlan(true);
      await apiClient.deleteAcademyPlan(deletingAcademyPlan.id);
      setDeletingAcademyPlan(null);
      await fetchAcademyPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsDeletingAcademyPlan(false);
    }
  }

  async function handleToggleAcademyPlanActive(plan: AcademyPlanData) {
    try {
      await apiClient.updateAcademyPlan(plan.id, {
        is_active: !plan.is_active
      });
      await fetchAcademyPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  }

  // Enterprise has no fixed price or DB-backed plan — it routes the manager
  // straight to a real sales ticket instead of a dead "contact us" button.
  async function handleSubmitContactSales() {
    try {
      setIsSubmittingContact(true);
      // Sales needs to know who is asking and what they run today, or the
      // first call is spent collecting facts the panel already has.
      const context = [
        t('plans.enterpriseContactAcademy', {
          name: selectedAcademy?.name ?? '—'
        }),
        t('plans.enterpriseContactCurrentPlan', {
          plan:
            currentSub?.academy?.custom_plan?.name ??
            currentPlan?.name ??
            t('subscriptionStatus.inactive'),
          term: t(
            currentSub?.period_months === 3
              ? 'plans.termQuarterly'
              : 'plans.termMonthly'
          )
        })
      ].join('\n');
      await apiClient.createPlatformTicket({
        // SALES routes it to the sales queue; BILLING would bury a new deal in
        // the invoice pile.
        subject: t('plans.enterpriseContactSubject'),
        category: 'SALES',
        priority: 'HIGH',
        body: `${contactMessage.trim() || t('plans.enterpriseContactSubject')}\n\n${context}`
      });
      toast.success(t('plans.enterpriseContactSuccess'));
      setIsContactOpen(false);
      setContactMessage('');
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSubmittingContact(false);
    }
  }

  const currentPlanSlug = currentSub?.academy?.subscription_plan ?? null;
  const currentPlan = currentPlanSlug
    ? plans.find(
        (p) => p.slug === currentPlanSlug || p.name === currentPlanSlug
      )
    : null;
  // Three states: no plan, free trial (ACTIVE but never paid), and a real paid
  // plan. Only the paid one is a prorated UPGRADE — a trial or no plan buys at
  // full price. `has_paid` (from the backend) is the deciding flag, NOT the
  // ACTIVE status, which a trial also has. While on a paid plan only higher
  // tiers may be selected; current/lower tiers unlock once it ends.
  const hasActivePaidPlan =
    currentSub?.status === 'ACTIVE' &&
    currentSub?.has_paid === true &&
    !!currentPlan;
  // A plan is only "the active plan" on the tab whose TERM was actually
  // bought. A monthly Growth academy is not on 3-month Growth, so the
  // quarterly tab must offer that card, not mark it as current.
  const currentPeriod: BillingPeriod =
    currentSub?.period_months === 3 ? 'quarterly' : 'monthly';
  const popularIndex = Math.floor(plans.length / 2);
  // Recommended is fixed on the popular tier; selection is a click-to-compare
  // highlight that only one card holds at a time (defaults to the current
  // plan, else the recommended one) — mirroring the public pricing page.
  const recommendedSlug = plans[popularIndex]?.slug ?? null;
  const [selectedCardSlug, setSelectedCardSlug] = useState<string | null>(null);
  useEffect(() => {
    if (selectedCardSlug || plans.length === 0) return;
    setSelectedCardSlug(currentPlanSlug ?? recommendedSlug);
  }, [selectedCardSlug, plans.length, currentPlanSlug, recommendedSlug]);
  const newestPaidInvoiceId = (currentSub?.invoices ?? [])
    .filter((invoice) => invoice.status === 'PAID')
    .reduce((newest, invoice) => Math.max(newest, invoice.id), 0);

  // On a paid plan the manager does not pay the target plan's full price — they
  // pay the prorated difference for the days left. Quote every higher tier up
  // front so each card can show that number instead of a price they never pay.
  // A prorated upgrade only exists for the term the academy is actually on:
  // it swaps the plan for the days already bought and never moves the expiry.
  // On the other tab the manager is buying a NEW term at full price, so no
  // quote applies there.
  // The backend decides when a renewal opens; the panel just mirrors it.
  const canRenewNow = currentSub?.can_renew_now !== false;
  const renewalWindowDays = currentSub?.renewal_window_days ?? 7;
  const canUpgradeInPeriod = hasActivePaidPlan && period === currentPeriod;
  const upgradableSlugs = useMemo(
    () =>
      canUpgradeInPeriod && currentPlan
        ? plans
            .filter((p) => p.sort_order > currentPlan.sort_order)
            .map((p) => p.slug)
        : [],
    [plans, currentPlan, canUpgradeInPeriod]
  );
  const { quotes: upgradeQuotes } = useUpgradeQuotes(
    upgradableSlugs,
    canManagePlan
  );

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (isTeacher) {
    return (
      <div className="fade-in-up flex-1 space-y-8 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {t('plans.badge')}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('plans.title')}
            </h1>
          </div>
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-3 py-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            {t('plans.viewOnly')}
          </Badge>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-info/20 bg-info/5 px-4 py-3 text-sm text-info">
          <Eye className="h-4 w-4 shrink-0" />
          {t('plans.teacherNote')}
        </div>
      </div>
    );
  }

  const academyPlansPanel = (
    <AcademyPlansList
      plans={academyPlans}
      isLoading={isAcademyPlansLoading}
      canManage={canManageAcademyPlans}
      onCreatePlan={openCreateAcademyPlan}
      onEditPlan={openEditAcademyPlan}
      onDeletePlan={setDeletingAcademyPlan}
      onToggleActive={handleToggleAcademyPlanActive}
      t={t}
    />
  );

  const sharedDialogs = (
    <>
      <PlanFormDialog
        open={isFormOpen}
        editingPlan={editingPlan}
        form={form}
        isSaving={isSaving}
        onClose={() => setIsFormOpen(false)}
        onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
        onSave={handleSavePlan}
        t={t}
      />

      <AcademyPlanFormDialog
        open={isAcademyPlanFormOpen}
        editingPlan={editingAcademyPlan}
        form={academyPlanForm}
        isSaving={isSavingAcademyPlan}
        onClose={() => setIsAcademyPlanFormOpen(false)}
        onChange={(field, value) =>
          setAcademyPlanForm((f) => ({ ...f, [field]: value }))
        }
        onSave={handleSaveAcademyPlan}
        t={t}
      />

      <Dialog
        open={!!deletingAcademyPlan}
        onOpenChange={(o) => !o && setDeletingAcademyPlan(null)}
      >
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('plans.deletePlan')}
            </DialogTitle>
            <DialogDescription>{t('plans.deleteWarning')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingAcademyPlan(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAcademyPlan}
              disabled={isDeletingAcademyPlan}
            >
              {isDeletingAcademyPlan && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (isPlatformAdminUser) {
    return (
      <div className="fade-in-up flex-1 space-y-6 p-4 sm:p-6" dir="rtl">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {t('plans.badge')}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('plans.title')}
          </h1>
        </div>

        <Tabs
          defaultValue="platform"
          onValueChange={(v) => {
            if (v === 'academy') fetchAcademyPlans();
          }}
        >
          <TabsList>
            <TabsTrigger value="platform">
              {t('plans.platformPlansTab')}
            </TabsTrigger>
            <TabsTrigger value="academy">
              {t('plans.academyPlansTab')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-6 pt-4">
            <PlatformPlansAdmin
              plans={plans}
              period={period}
              setPeriod={setPeriod}
              popularIndex={popularIndex}
              onOpenCreate={openCreate}
              onEdit={openEdit}
              onDelete={setDeletingPlan}
              onToggleActive={handleTogglePlanActive}
              t={t}
            />
          </TabsContent>

          <TabsContent value="academy" className="pt-4">
            {academyPlansPanel}
          </TabsContent>
        </Tabs>

        <Dialog
          open={!!deletingPlan}
          onOpenChange={(o) => !o && setDeletingPlan(null)}
        >
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {t('plans.deletePlan')}
              </DialogTitle>
              <DialogDescription>{t('plans.deleteWarning')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingPlan(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePlan}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                {t('common.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {sharedDialogs}
      </div>
    );
  }

  // Manager / Academy Admin View
  return (
    <div className="fade-in-up flex-1 space-y-6 p-4 sm:p-6" dir="rtl">
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t('plans.badge')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('plans.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('plans.subtitle')}
        </p>
      </div>

      <Tabs
        value={managerTab}
        onValueChange={(v) => {
          const next = v as 'subscription' | 'academy';
          setManagerTab(next);
          if (next === 'academy') fetchAcademyPlans();
        }}
      >
        <TabsList>
          <TabsTrigger value="subscription">
            {t('plans.mySubscriptionTab')}
          </TabsTrigger>
          <TabsTrigger value="academy">
            {t('plans.academyPlansTab')}
          </TabsTrigger>
        </TabsList>

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
            onBuyStorageAddon={
              canManagePlan ? () => void handleBuyStorageAddon() : undefined
            }
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
              <p className="text-sm text-muted-foreground">
                {t('plans.noPlanConfigured')}
              </p>
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
                const isPopular =
                  !selectedAcademy && i === popularIndex && plans.length >= 2;
                // Only a genuinely PAID plan is "current" (locked). During a
                // free trial the academy sits on a plan it hasn't paid for, so
                // every tier — including that one — stays buyable at full price
                // to convert the trial into a paid subscription.
                const isSameTier =
                  hasActivePaidPlan &&
                  (currentPlan?.slug === plan.slug ||
                    currentPlan?.id === plan.id);
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
                const isUpperPlan = currentPlan
                  ? plan.sort_order > currentPlan.sort_order
                  : true;
                const isLocked =
                  hasActivePaidPlan &&
                  ((!isSameTier && !isUpperPlan) || (isExtend && !canRenewNow));
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
                    onSelect={() =>
                      (!isCurrent || canRenew) &&
                      !isLocked &&
                      openSelectPlan(plan)
                    }
                    t={t}
                  />
                );
              })}
              {canManagePlan && (
                <EnterprisePlanCard
                  onContact={() => setIsContactOpen(true)}
                  t={t}
                />
              )}
            </div>
          )}
        </TabsContent>

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

      {selectingPlan && (
        <Dialog open onOpenChange={(o) => !o && setSelectingPlan(null)}>
          <DialogContent className="gap-0 sm:max-w-md" dir="rtl">
            <DialogHeader className="space-y-1 pb-3">
              <DialogTitle>{t('plans.confirmChangePlan')}</DialogTitle>
              {!upgradeQuote && !isQuoteLoading && (
                <DialogDescription className="text-xs">
                  {t('plans.confirmChangePlanDesc')}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">
                    {t('plans.choosePlan')}
                  </p>
                  <p className="truncate font-bold">{selectingPlan.name}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatPrice(selectingPlan.price_monthly)}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {t('plans.pricePerMonth')}
                  </span>
                </p>
              </div>

              {isQuoteLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : upgradeQuote ? (
                <UpgradeSummary
                  quote={upgradeQuote}
                  appliedVoucher={appliedVoucher}
                  t={t}
                />
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {t('plans.subscriptionPeriod')}
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PERIOD_OPTIONS.map(({ months, key }) => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => {
                            setSelectedMonths(months);
                            setAppliedVoucher(null);
                          }}
                          className={cn(
                            'rounded-lg border px-2 py-2 text-sm font-medium transition-all duration-150',
                            selectedMonths === months
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-card text-foreground hover:border-primary/40'
                          )}
                        >
                          {t(`plans.${key}` as Parameters<typeof t>[0])}
                        </button>
                      ))}
                    </div>
                  </div>
                  {currentSub?.storage?.addon_gb != null && (
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-xs">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={includeStorageAddon}
                        onChange={(e) => {
                          setIncludeStorageAddon(e.target.checked);
                          setAppliedVoucher(null);
                        }}
                      />
                      <span>
                        {t('plans.includeStorageAddon', {
                          gb: currentSub.storage.addon_gb
                        })}
                        {currentSub.storage.addon_price_toman != null && (
                          <span className="text-muted-foreground">
                            {' '}
                            ({formatPrice(
                              currentSub.storage.addon_price_toman
                            )}{' '}
                            {t('plans.toman')})
                          </span>
                        )}
                      </span>
                    </label>
                  )}
                  {(() => {
                    const subtotal =
                      periodPrice(
                        selectingPlan,
                        selectedMonths === 3 ? 'quarterly' : 'monthly'
                      ) +
                      (includeStorageAddon
                        ? (currentSub?.storage?.addon_price_toman ?? 0)
                        : 0);
                    const hasDiscount =
                      !!appliedVoucher && appliedVoucher.discountAmount > 0;
                    const discountedSubtotal = hasDiscount
                      ? appliedVoucher!.finalAmount
                      : subtotal;
                    const vatRate = selectingPlan.vat_rate ?? 0;
                    const vat = vatAmount(discountedSubtotal, vatRate);
                    const grandTotal = discountedSubtotal + vat;
                    return (
                      <div className="space-y-1 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {t('plans.totalPrice')}
                          </span>
                          <span
                            className={cn(
                              'font-bold tabular-nums',
                              hasDiscount &&
                                'text-sm font-normal text-muted-foreground line-through'
                            )}
                          >
                            {formatPrice(subtotal)} {t('plans.toman')}
                          </span>
                        </div>
                        {hasDiscount && (
                          <div className="flex items-center justify-between text-success">
                            <span>{t('plans.voucherDiscount')}</span>
                            <span className="tabular-nums">
                              − {formatPrice(appliedVoucher!.discountAmount)}{' '}
                              {t('plans.toman')}
                            </span>
                          </div>
                        )}
                        {vat > 0 && (
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>
                              {t('plans.vatIncluded', {
                                percent: Math.round(vatRate * 100)
                              })}
                            </span>
                            <span className="tabular-nums">
                              + {formatPrice(vat)} {t('plans.toman')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-border/50 pt-1 font-bold text-primary">
                          <span>{t('plans.finalPayableAmount')}</span>
                          <span className="tabular-nums">
                            {formatPrice(grandTotal)} {t('plans.toman')}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
              {(needsGatewaySelection || availableGateways.length > 1) && (
                <div className="space-y-2">
                  <Label>{t('plans.selectGateway')}</Label>
                  <div className="grid gap-2">
                    {availableGateways.map((gw) => {
                      const provider = gw.provider as PaymentGatewayProvider;
                      return (
                        <button
                          key={gw.provider}
                          type="button"
                          onClick={() => setSelectedGateway(provider)}
                          className={cn(
                            'flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-start text-sm font-medium transition-all duration-150',
                            selectedGateway === provider
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-card text-foreground hover:border-primary/40'
                          )}
                        >
                          <span className="truncate">{gw.display_name}</span>
                          {selectedGateway === provider && (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="plan-voucher-code" className="text-xs">
                  {t('plans.voucherCode')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="plan-voucher-code"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value);
                      if (appliedVoucher) setAppliedVoucher(null);
                    }}
                    placeholder={t('plans.voucherCodePlaceholder')}
                    autoComplete="off"
                    disabled={isChanging || isValidatingVoucher}
                    className="font-mono uppercase"
                  />
                  {appliedVoucher ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveVoucher}
                      disabled={isChanging || isValidatingVoucher}
                      className="shrink-0 whitespace-nowrap"
                    >
                      {t('plans.removeVoucher')}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleApplyVoucher}
                      disabled={
                        !voucherCode.trim() || isChanging || isValidatingVoucher
                      }
                      className="min-w-[6.5rem] shrink-0 whitespace-nowrap px-4"
                    >
                      {isValidatingVoucher ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t('plans.applyVoucher')
                      )}
                    </Button>
                  )}
                </div>
                {appliedVoucher ? (
                  <p className="text-[11px] font-medium text-success">
                    {t('plans.voucherApplied')}: {appliedVoucher.code} (−
                    {formatPrice(appliedVoucher.discountAmount)}{' '}
                    {t('plans.toman')})
                  </p>
                ) : (
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    {t('plans.voucherCodeHint')}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="pt-3">
              <Button variant="outline" onClick={() => setSelectingPlan(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleChangePlan}
                disabled={
                  isChanging ||
                  isQuoteLoading ||
                  (needsGatewaySelection &&
                    availableGateways.length > 1 &&
                    !selectedGateway)
                }
              >
                {isChanging && (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                {upgradeQuote
                  ? t('plans.confirmUpgrade')
                  : t('plans.confirmChange')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{t('plans.enterpriseContactDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('plans.enterpriseContactDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder={t('plans.enterpriseContactPlaceholder')}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmitContactSales}
              disabled={isSubmittingContact}
            >
              {isSubmittingContact && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {t('plans.enterpriseContactSubmit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sharedDialogs}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function UpgradeSummary({
  quote,
  appliedVoucher,
  t
}: {
  quote: AcademyUpgradeQuote;
  appliedVoucher?: { discountAmount: number; finalAmount: number } | null;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const hasStorageCredit = quote.storage_amount_toman !== 0;
  const hasVoucher =
    appliedVoucher != null && appliedVoucher.discountAmount > 0;
  const discountedSubtotal = hasVoucher
    ? appliedVoucher.finalAmount
    : quote.amount_toman;
  const vatRate = quote.vat_rate ?? 0;
  const vat = vatAmount(discountedSubtotal, vatRate);
  const finalPrice = discountedSubtotal + vat;

  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
      <p className="text-[11px] leading-snug text-muted-foreground">
        {t('plans.upgradeWhyLess', {
          days: quote.remainingDays,
          plan: getPlanDisplayName(quote.fromSlug) ?? quote.fromSlug
        })}
      </p>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{t('plans.planDiff')}</span>
          <span className="tabular-nums">
            {formatPrice(quote.plan_amount_toman)} {t('plans.toman')}
          </span>
        </div>
        {hasStorageCredit && (
          <div className="flex items-center justify-between text-success">
            <span>{t('plans.storageCredit')}</span>
            <span className="tabular-nums">
              − {formatPrice(Math.abs(quote.storage_amount_toman))}{' '}
              {t('plans.toman')}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border/50 pt-1.5 font-bold">
          <span>{t('plans.proratedTotal')}</span>
          <span
            className={cn(
              'tabular-nums',
              (hasVoucher || vat > 0) &&
                'text-sm font-normal text-muted-foreground line-through'
            )}
          >
            {formatPrice(quote.amount_toman)} {t('plans.toman')}
          </span>
        </div>
        {hasVoucher && (
          <div className="flex items-center justify-between font-medium text-success">
            <span>{t('plans.voucherDiscount')}</span>
            <span className="tabular-nums">
              − {formatPrice(appliedVoucher.discountAmount)} {t('plans.toman')}
            </span>
          </div>
        )}
        {vat > 0 && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>
              {t('plans.vatIncluded', { percent: Math.round(vatRate * 100) })}
            </span>
            <span className="tabular-nums">
              + {formatPrice(vat)} {t('plans.toman')}
            </span>
          </div>
        )}
        {(hasVoucher || vat > 0) && (
          <div className="flex items-center justify-between border-t border-border/50 pt-1 font-bold text-primary">
            <span>{t('plans.finalPayableAmount')}</span>
            <span className="tabular-nums">
              {formatPrice(finalPrice)} {t('plans.toman')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function BillingPeriodToggle({
  period,
  setPeriod,
  t
}: {
  period: BillingPeriod;
  setPeriod: (p: BillingPeriod) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
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
      {period === 'quarterly' && (
        <p className="max-w-md text-center text-xs text-muted-foreground">
          {t('plans.quarterlyHint')}
        </p>
      )}
    </div>
  );
}

function CurrentSubscriptionBanner({
  currentSub,
  currentPlan,
  t,
  onBuyStorageAddon,
  isBuyingAddon
}: {
  currentSub: AcademySubscriptionState | null;
  currentPlan: SubscriptionPlanData | null | undefined;
  t: (key: string, params?: Record<string, string | number>) => string;
  onBuyStorageAddon?: () => void;
  isBuyingAddon?: boolean;
}) {
  if (!currentSub?.academy) return null;
  const expiresAt = currentSub.academy.subscription_expires;
  const storageUsedGb = currentSub.storage?.usage_gb;
  const includedStorageGb = currentSub.storage?.included_gb;
  const warnLevel = currentSub.storage?.warn_level;
  const display = getSubscriptionStatusDisplay(
    currentSub.status,
    currentSub.is_trial
  );

  // Never selected/paid a plan: the `starter` value is only a DB default, not a
  // real subscription, so we must NOT render it as a plan (name, crown, quota).
  // Show a neutral "no plan yet — pick one below" state instead.
  if (currentSub.status === 'INACTIVE') {
    return (
      <div className="rounded-2xl border bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Crown className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                {t('subscriptionStatus.noPlanTitle')}
              </p>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                  SUBSCRIPTION_TONE_CLASSES.inactive
                )}
              >
                {t('subscriptionStatus.inactive')}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t('subscriptionStatus.startPlanHint')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">
              {currentSub.academy.custom_plan?.name ??
                currentPlan?.name ??
                getPlanDisplayName(currentSub.academy.subscription_plan)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  SUBSCRIPTION_TONE_CLASSES[display.tone]
                )}
              >
                {t(display.labelKey)}
              </span>
              {currentSub.has_paid && (
                <span>
                  {t(
                    currentSub.period_months === 3
                      ? 'plans.termQuarterly'
                      : 'plans.termMonthly'
                  )}
                </span>
              )}
              {expiresAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t('plans.expiresAt')}{' '}
                  {new Date(expiresAt).toLocaleDateString('fa-IR')}
                </span>
              )}
            </div>
            {display.needsPlan && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t('subscriptionStatus.startPlanHint')}
              </p>
            )}
          </div>
        </div>

        {includedStorageGb !== undefined && storageUsedGb !== undefined && (
          <div className="flex gap-5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span className="font-semibold text-foreground">
                {formatStorage(storageUsedGb)}
              </span>
              <span className="text-xs">
                / {formatStorage(includedStorageGb)}
              </span>
            </div>
          </div>
        )}
      </div>

      {includedStorageGb !== undefined && storageUsedGb !== undefined && (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('plans.storageUsed')}</span>
            <span>
              {formatStorage(storageUsedGb)} /{' '}
              {formatStorage(includedStorageGb)}
            </span>
          </div>
          <Progress
            value={Math.min((storageUsedGb / includedStorageGb) * 100, 100)}
            className={cn(
              'h-1.5',
              warnLevel === 'full' && '[&>div]:bg-destructive',
              warnLevel === 'warning' && '[&>div]:bg-amber-500'
            )}
          />
          {(warnLevel === 'warning' || warnLevel === 'full') && (
            <div
              className={cn(
                'flex flex-col gap-2 rounded-xl px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between',
                warnLevel === 'full'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-amber-500/10 text-amber-800 dark:text-amber-200'
              )}
            >
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {warnLevel === 'full'
                  ? t('plans.storageFull', {
                      gb: currentSub.storage?.addon_gb ?? 50
                    })
                  : t('plans.storageAlmostFull', {
                      percent: currentSub.storage?.percent_used ?? 80
                    })}
              </p>
              {onBuyStorageAddon && (
                <Button
                  type="button"
                  size="sm"
                  variant={warnLevel === 'full' ? 'destructive' : 'outline'}
                  disabled={isBuyingAddon}
                  onClick={onBuyStorageAddon}
                  className="shrink-0"
                >
                  {isBuyingAddon ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    t('plans.buyStorageAddon', {
                      gb: currentSub.storage?.addon_gb ?? 50
                    })
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubscriptionPlanCard({
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
  t
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
  const qDiscount =
    period === 'quarterly' ? quarterlyDiscount(plan.price_monthly) : null;

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
            : 'border-border hover:border-primary/40 hover:shadow-md'
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

      <h2 className="text-center text-lg font-bold text-foreground">
        {plan.name}
      </h2>
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
              <span className="ms-2 text-[13px] text-muted-foreground">
                {t('plans.toman')}
              </span>
            )}
          </p>
          <p className="mt-1.5 text-[12px] font-semibold text-primary/80">
            {t('plans.upgradeCostLabel', {
              days: formatPrice(upgradeQuote.remainingDays)
            })}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {t(
              upgradeQuote.periodMonths === 3
                ? 'plans.upgradeThenFullQuarterly'
                : 'plans.upgradeThenFullMonthly',
              {
                price: formatPrice(upgradeQuote.target_plan.price_period_toman)
              }
            )}
          </p>
        </div>
      ) : (
        <p className="mt-6 text-center">
          <span className="text-[34px] font-black leading-none text-foreground">
            {formatPrice(price)}
          </span>
          <span className="ms-2 text-[13px] text-muted-foreground">
            {period === 'quarterly'
              ? t('plans.pricePerQuarter')
              : t('plans.pricePerMonth')}
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
                  price: formatPrice(qDiscount.full)
                })}
              </span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 font-semibold text-success">
                {t('plans.quarterlyDiscount', { percent: qDiscount.percent })}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">
              {t('plans.equivalentPerMonth', {
                price: formatPrice(Math.round(price / 3))
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
              <Check
                size={15}
                strokeWidth={3}
                aria-hidden
                className="mt-1 shrink-0 text-primary"
              />
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
                  : 'border border-border bg-muted/40 text-foreground hover:border-primary/40'
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
                {isExtend
                  ? t('plans.renewLockedShort')
                  : t('plans.lockedShort')}
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

// Enterprise has no fixed price or storage cap in the plan catalog — it is a
// custom deal closed by sales, not a self-serve tier, so this card always
// routes to "contact us" instead of a price + choose-plan button.
function EnterprisePlanCard({
  onContact,
  t
}: {
  onContact: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const features = [
    t('plans.enterpriseFeature1'),
    t('plans.enterpriseFeature2'),
    t('plans.enterpriseFeature3')
  ];
  return (
    <div
      dir="rtl"
      className="relative flex h-full flex-col rounded-2xl border border-dashed border-border bg-muted/20 p-8"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Building2 className="h-5 w-5 text-primary" />
      </div>

      <h2 className="mt-4 text-center text-lg font-bold text-foreground">
        {t('plans.enterprisePlanName')}
      </h2>
      <p className="mt-1.5 text-center text-[13px] text-muted-foreground">
        {t('plans.enterpriseTagline')}
      </p>

      <p className="mt-6 text-center">
        <span className="text-[26px] font-black leading-none text-foreground">
          {t('plans.enterprisePriceLabel')}
        </span>
      </p>

      <ul className="mt-7 flex flex-1 flex-col gap-3.5">
        {features.map((feature, fi) => (
          <li
            key={fi}
            className="flex items-start gap-2.5 text-[13.5px] leading-[1.7] text-foreground/80"
          >
            <Check
              size={15}
              strokeWidth={3}
              aria-hidden
              className="mt-1 shrink-0 text-primary"
            />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onContact}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold text-foreground transition-all duration-150 hover:border-primary/40"
      >
        {t('plans.contactSales')}
      </button>
    </div>
  );
}

function PlatformPlansAdmin({
  plans,
  period,
  setPeriod,
  popularIndex,
  onOpenCreate,
  onEdit,
  onDelete,
  onToggleActive,
  t
}: {
  plans: SubscriptionPlanData[];
  period: BillingPeriod;
  setPeriod: (p: BillingPeriod) => void;
  popularIndex: number;
  onOpenCreate: () => void;
  onEdit: (plan: SubscriptionPlanData) => void;
  onDelete: (plan: SubscriptionPlanData) => void;
  onToggleActive: (plan: SubscriptionPlanData) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BillingPeriodToggle period={period} setPeriod={setPeriod} t={t} />
        <Button onClick={onOpenCreate} size="sm" className="w-full sm:w-auto">
          <Plus className="me-2 h-4 w-4" />
          {t('plans.addPlan')}
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border bg-card py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Zap className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('plans.noPlanConfigured')}
          </p>
          <Button
            onClick={onOpenCreate}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <Plus className="me-2 h-4 w-4" />
            {t('plans.createFirstPlan')}
          </Button>
        </div>
      ) : (
        <div
          dir="rtl"
          className="stagger-children grid items-stretch gap-5 pt-3 sm:grid-cols-3"
        >
          {plans.map((plan, i) => {
            const isPopular = i === popularIndex && plans.length >= 2;
            const price = periodPrice(plan, period);
            const features = plan.features ?? [];
            return (
              <div
                key={plan.id}
                dir="rtl"
                className={cn(
                  'relative rounded-2xl border p-7 text-right transition-all duration-200',
                  isPopular
                    ? '-translate-y-1 border-foreground bg-foreground text-background shadow-xl'
                    : 'border-border bg-card hover:shadow-md',
                  !plan.is_active && 'opacity-60'
                )}
              >
                <div className="absolute start-3.5 top-3.5 flex items-center gap-1.5">
                  {isPopular && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-semibold text-primary-foreground">
                      {t('plans.popular')}
                    </span>
                  )}
                  {!plan.is_active && (
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10.5px] font-medium',
                        isPopular
                          ? 'border-background/20 bg-background/10 text-background/70'
                          : 'border-border bg-muted text-muted-foreground'
                      )}
                    >
                      {t('plans.inactive')}
                    </span>
                  )}
                </div>

                <div className="absolute end-3 top-3 flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${plan.name}`}
                    onClick={() => onEdit(plan)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isPopular
                        ? 'text-background/60 hover:bg-white/10 hover:text-background'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${plan.name}`}
                    onClick={() => onDelete(plan)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isPopular
                        ? 'text-background/60 hover:bg-red-500/20 hover:text-red-300'
                        : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div
                  className={cn(
                    'mb-1 mt-6 text-[11px] font-semibold uppercase tracking-widest',
                    isPopular
                      ? 'text-background/40'
                      : 'text-muted-foreground/50'
                  )}
                >
                  {t('plans.sortOrder')}{' '}
                  {plan.sort_order.toLocaleString('fa-IR')}
                </div>
                <h2
                  className={cn(
                    'text-[24px] font-bold tracking-tight',
                    isPopular ? 'text-background' : 'text-foreground'
                  )}
                >
                  {plan.name}
                </h2>

                <div className="mb-5 mt-4 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  <span
                    className={cn(
                      'text-[32px] font-extrabold tracking-tight',
                      isPopular ? 'text-background' : 'text-foreground'
                    )}
                  >
                    {formatPrice(price)}
                  </span>
                  <span
                    className={cn(
                      'text-[13px]',
                      isPopular ? 'text-background/50' : 'text-muted-foreground'
                    )}
                  >
                    {period === 'quarterly'
                      ? t('plans.pricePerQuarter')
                      : t('plans.pricePerMonth')}
                  </span>
                </div>

                <div
                  className={cn(
                    'mb-4 flex items-center gap-2 text-sm',
                    isPopular ? 'text-background/70' : 'text-muted-foreground'
                  )}
                >
                  <HardDrive className="h-4 w-4 shrink-0" />
                  {formatStorage(plan.storage_limit_gb)} {t('plans.storage')}
                </div>

                {features.length > 0 && (
                  <ul className="space-y-2.5">
                    {features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span
                          className={cn(
                            isPopular
                              ? 'text-background/90'
                              : 'text-foreground/75'
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div
                  className={cn(
                    'mt-5 flex items-center justify-between border-t pt-4',
                    isPopular ? 'border-background/10' : 'border-border/50'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isPopular ? 'text-background/60' : 'text-muted-foreground'
                    )}
                  >
                    {t('plans.toggleActive')}
                  </span>
                  <Switch
                    checked={plan.is_active}
                    onCheckedChange={() => onToggleActive(plan)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
