'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin } from '@/lib/roles';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useUpgradeQuotes } from '@/hooks/use-upgrade-quotes';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { AcademyPlansList } from '@/components/plans/AcademyPlansList';
import { SubscriptionPlanData, type BillingPeriod } from '@/components/plans/plan-types';
import { ManagerPlansTabs } from './_components/manager-plans-tabs';
import { SelectPlanDialog } from './_components/select-plan-dialog';
import { ContactSalesDialog } from './_components/contact-sales-dialog';
import { PlansDialogs } from './_components/plans-dialogs';
import { PlatformPlansView } from './_components/platform-plans-view';
import { usePlanPurchase } from './_hooks/use-plan-purchase';
import { usePlatformPlanAdmin } from './_hooks/use-platform-plan-admin';
import { useAcademyPlanAdmin } from './_hooks/use-academy-plan-admin';
import { useContactSales } from './_hooks/use-contact-sales';
import { usePlansUrlParams } from './_hooks/use-plans-url-params';
import { TeacherPlansView } from './_components/teacher-plans-view';

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
    tabParam === 'academy' ? 'academy' : 'subscription',
  );

  const isPlatformAdminUser = isPlatformAdmin(user);
  const canManagePlan =
    !isPlatformAdminUser && (user?.role === 'ADMIN' || user?.role === 'MANAGER');
  const isTeacher = user?.role === 'TEACHER';
  const canManageAcademyPlans = isPlatformAdminUser || canManagePlan;

  const [period, setPeriod] = useState<BillingPeriod>(
    periodParam === 'quarterly' ? 'quarterly' : 'monthly',
  );
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  // Shared with the sidebar/header via one SWR cache key — avoids firing the
  // same /academies/current/subscription request three times per page load.
  const {
    subscription: currentSub,
    isLoading: isSubLoading,
    refresh: refreshSubscription,
  } = useAcademySubscription(!isPlatformAdminUser);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const isLoading = isPlansLoading || (!isPlatformAdminUser && isSubLoading);

  // Present only when the selected plan is an UPGRADE (active paid plan → higher
  // tier): its presence switches the dialog from full-price purchase to the
  // prorated diff.

  const selectedAcademy = useCurrentAcademy();

  const {
    academyPlanForm,
    academyPlans,
    deletingAcademyPlan,
    editingAcademyPlan,
    fetchAcademyPlans,
    handleDeleteAcademyPlan,
    handleSaveAcademyPlan,
    handleToggleAcademyPlanActive,
    isAcademyPlanFormOpen,
    isAcademyPlansLoading,
    isDeletingAcademyPlan,
    isSavingAcademyPlan,
    openCreateAcademyPlan,
    openEditAcademyPlan,
    setAcademyPlanForm,
    setDeletingAcademyPlan,
    setIsAcademyPlanFormOpen,
  } = useAcademyPlanAdmin();

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

  const {
    deletingPlan,
    editingPlan,
    form,
    handleDeletePlan,
    handleSavePlan,
    handleTogglePlanActive,
    isDeleting,
    isFormOpen,
    isSaving,
    openCreate,
    openEdit,
    setDeletingPlan,
    setForm,
    setIsFormOpen,
  } = usePlatformPlanAdmin({ fetchSubscriptionPlans });

  // Plan CRUD only touches the plans list. Buying/upgrading/moving a trial
  // changes the subscription itself, so those flows must also refresh it.
  const refreshPlansAndSubscription = useCallback(async () => {
    await Promise.all([fetchSubscriptionPlans(), refreshSubscription()]);
  }, [fetchSubscriptionPlans, refreshSubscription]);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, [fetchSubscriptionPlans]);

  // Coming from the landing page's "enroll" link: open the confirm dialog
  // pre-selected on that plan so buying it is one click away, not a re-pick.
  // Guarded by a ref (not just clearing the param) so the dialog doesn't
  // reopen if the manager closes it and the plans list re-renders.

  // Enterprise has no fixed price or DB-backed plan — it routes the manager
  // straight to a real sales ticket instead of a dead "contact us" button.

  const currentPlanSlug = currentSub?.academy?.subscription_plan ?? null;
  const currentPlan = currentPlanSlug
    ? plans.find((p) => p.slug === currentPlanSlug || p.name === currentPlanSlug)
    : null;

  const {
    contactMessage,
    handleSubmitContactSales,
    isContactOpen,
    isSubmittingContact,
    setContactMessage,
    setIsContactOpen,
  } = useContactSales({ currentPlan, currentSub, selectedAcademy });
  // Three states: no plan, free trial (ACTIVE but never paid), and a real paid
  // plan. Only the paid one is a prorated UPGRADE — a trial or no plan buys at
  // full price. `has_paid` (from the backend) is the deciding flag, NOT the
  // ACTIVE status, which a trial also has. While on a paid plan only higher
  // tiers may be selected; current/lower tiers unlock once it ends.
  const hasActivePaidPlan =
    currentSub?.status === 'ACTIVE' && currentSub?.has_paid === true && !!currentPlan;
  // A plan is only "the active plan" on the tab whose TERM was actually
  // bought. A monthly Growth academy is not on 3-month Growth, so the
  // quarterly tab must offer that card, not mark it as current.
  const currentPeriod: BillingPeriod = currentSub?.period_months === 3 ? 'quarterly' : 'monthly';

  const {
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
  } = usePlanPurchase({
    currentPeriod,
    currentPlan,
    currentSub,
    hasActivePaidPlan,
    period,
    refreshPlansAndSubscription,
  });

  usePlansUrlParams({
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
  });
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
        ? plans.filter((p) => p.sort_order > currentPlan.sort_order).map((p) => p.slug)
        : [],
    [plans, currentPlan, canUpgradeInPeriod],
  );
  const { quotes: upgradeQuotes } = useUpgradeQuotes(upgradableSlugs, canManagePlan);

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
    return <TeacherPlansView />;
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
    <PlansDialogs
      academyPlanForm={academyPlanForm}
      deletingAcademyPlan={deletingAcademyPlan}
      editingAcademyPlan={editingAcademyPlan}
      editingPlan={editingPlan}
      form={form}
      handleDeleteAcademyPlan={handleDeleteAcademyPlan}
      handleSaveAcademyPlan={handleSaveAcademyPlan}
      handleSavePlan={handleSavePlan}
      isAcademyPlanFormOpen={isAcademyPlanFormOpen}
      isDeletingAcademyPlan={isDeletingAcademyPlan}
      isFormOpen={isFormOpen}
      isSaving={isSaving}
      isSavingAcademyPlan={isSavingAcademyPlan}
      setAcademyPlanForm={setAcademyPlanForm}
      setDeletingAcademyPlan={setDeletingAcademyPlan}
      setForm={setForm}
      setIsAcademyPlanFormOpen={setIsAcademyPlanFormOpen}
      setIsFormOpen={setIsFormOpen}
    />
  );

  if (isPlatformAdminUser) {
    return (
      <PlatformPlansView
        academyPlansPanel={academyPlansPanel}
        deletingPlan={deletingPlan}
        fetchAcademyPlans={fetchAcademyPlans}
        handleDeletePlan={handleDeletePlan}
        handleTogglePlanActive={handleTogglePlanActive}
        isDeleting={isDeleting}
        openCreate={openCreate}
        openEdit={openEdit}
        period={period}
        plans={plans}
        popularIndex={popularIndex}
        setDeletingPlan={setDeletingPlan}
        setPeriod={setPeriod}
        sharedDialogs={sharedDialogs}
      />
    );
  }

  // Manager / Academy Admin View
  return (
    <div className="fade-in-up flex-1 space-y-6 p-4 sm:p-6" dir="rtl">
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t('plans.badge')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('plans.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('plans.subtitle')}</p>
      </div>

      <ManagerPlansTabs
        academyPlansPanel={academyPlansPanel}
        canManagePlan={canManagePlan}
        canRenewNow={canRenewNow}
        currentPeriod={currentPeriod}
        currentPlan={currentPlan}
        currentSub={currentSub}
        fetchAcademyPlans={fetchAcademyPlans}
        handleBuyStorageAddon={handleBuyStorageAddon}
        hasActivePaidPlan={hasActivePaidPlan}
        isBuyingAddon={isBuyingAddon}
        managerTab={managerTab}
        openSelectPlan={openSelectPlan}
        period={period}
        plans={plans}
        popularIndex={popularIndex}
        refreshPlansAndSubscription={refreshPlansAndSubscription}
        renewalWindowDays={renewalWindowDays}
        selectedAcademy={selectedAcademy}
        selectedCardSlug={selectedCardSlug}
        setIsContactOpen={setIsContactOpen}
        setManagerTab={setManagerTab}
        setPeriod={setPeriod}
        setSelectedCardSlug={setSelectedCardSlug}
        upgradeQuotes={upgradeQuotes}
      />

      {selectingPlan && (
        <SelectPlanDialog
          appliedVoucher={appliedVoucher}
          availableGateways={availableGateways}
          currentSub={currentSub}
          handleApplyVoucher={handleApplyVoucher}
          handleChangePlan={handleChangePlan}
          handleRemoveVoucher={handleRemoveVoucher}
          includeStorageAddon={includeStorageAddon}
          isChanging={isChanging}
          isQuoteLoading={isQuoteLoading}
          isValidatingVoucher={isValidatingVoucher}
          needsGatewaySelection={needsGatewaySelection}
          selectedGateway={selectedGateway}
          selectedMonths={selectedMonths}
          selectingPlan={selectingPlan}
          setAppliedVoucher={setAppliedVoucher}
          setIncludeStorageAddon={setIncludeStorageAddon}
          setSelectedGateway={setSelectedGateway}
          setSelectedMonths={setSelectedMonths}
          setSelectingPlan={setSelectingPlan}
          setVoucherCode={setVoucherCode}
          upgradeQuote={upgradeQuote}
          voucherCode={voucherCode}
        />
      )}

      <ContactSalesDialog
        contactMessage={contactMessage}
        handleSubmitContactSales={handleSubmitContactSales}
        isContactOpen={isContactOpen}
        isSubmittingContact={isSubmittingContact}
        setContactMessage={setContactMessage}
        setIsContactOpen={setIsContactOpen}
      />

      {sharedDialogs}
    </div>
  );
}
