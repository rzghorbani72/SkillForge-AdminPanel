'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Check,
  CheckCircle2,
  Loader2,
  Crown,
  Calendar,
  HardDrive,
  Users,
  AlertTriangle,
  Eye,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { cn } from '@/lib/utils';
import { PlansTabScopeHeader } from '@/components/plans/plans-tab-scope-header';
import { PlanFormDialog } from '@/components/plans/PlanFormDialog';
import { AcademyPlanFormDialog } from '@/components/plans/AcademyPlanFormDialog';
import { AcademyPlansList } from '@/components/plans/AcademyPlansList';
import {
  AcademySubscription,
  AcademyPlanData,
  PlanFormData,
  AcademyPlanFormData,
  SubscriptionPlanData,
  DEFAULT_PLAN_FORM,
  DEFAULT_ACADEMY_PLAN_FORM,
  PERIOD_OPTIONS,
  formatPrice,
  formatStorage
} from '@/components/plans/plan-types';

export default function PlansPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [managerTab, setManagerTab] = useState<'subscription' | 'academy'>(
    tabParam === 'academy' ? 'academy' : 'subscription'
  );

  const isPlatformAdmin =
    user?.role === 'ADMIN' && (user?.isAdminProfile || user?.platformLevel);
  const canManagePlan =
    !isPlatformAdmin && (user?.role === 'ADMIN' || user?.role === 'MANAGER');
  const isTeacher = user?.role === 'TEACHER';
  const canManageAcademyPlans = isPlatformAdmin || canManagePlan;

  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [currentSub, setCurrentSub] = useState<AcademySubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

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
  const [isChanging, setIsChanging] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<
    'SAMAN_SEP' | 'MELLAT_BP' | null
  >(null);
  const [availableGateways, setAvailableGateways] = useState<
    Array<{ provider: string; display_name: string }>
  >([]);
  const [needsGatewaySelection, setNeedsGatewaySelection] = useState(false);

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

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const plansPromise = isPlatformAdmin
        ? apiClient.getSubscriptionPlans().catch(() => [])
        : apiClient.getActivePlans().catch(() => []);
      const subPromise = !isPlatformAdmin
        ? apiClient.getCurrentAcademySubscription().catch(() => null)
        : Promise.resolve(null);
      const [plansData, subData] = await Promise.all([
        plansPromise,
        subPromise
      ]);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setCurrentSub(subData);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [isPlatformAdmin]);

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
    if (tabParam === 'academy') {
      setManagerTab('academy');
      void fetchAcademyPlans();
    }
  }, [tabParam, fetchAcademyPlans]);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, [fetchSubscriptionPlans]);

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
    setSelectedMonths(1);
    setSelectedGateway(null);
    setAvailableGateways([]);
    setNeedsGatewaySelection(false);
  }

  function callbackUrlForProvider(provider: 'SAMAN_SEP' | 'MELLAT_BP'): string {
    const origin = window.location.origin;
    return provider === 'SAMAN_SEP'
      ? `${origin}/payment/saman-callback`
      : `${origin}/payment/mellat-callback`;
  }

  async function handleChangePlan() {
    if (!selectingPlan) return;
    try {
      setIsChanging(true);

      let provider = selectedGateway;
      if (!provider) {
        const probe = await apiClient.renewCurrentAcademySubscription({
          plan_name: selectingPlan.slug,
          months: selectedMonths,
          amount: selectingPlan.price_monthly * selectedMonths,
          callback_url: `${window.location.origin}/payment/saman-callback`
        });

        if (probe.redirect_url) {
          window.location.href = probe.redirect_url;
          return;
        }

        if (probe.needs_gateway_selection && probe.available_gateways?.length) {
          setAvailableGateways(probe.available_gateways);
          if (probe.available_gateways.length === 1) {
            provider = probe.available_gateways[0].provider as
              | 'SAMAN_SEP'
              | 'MELLAT_BP';
            setSelectedGateway(provider);
          } else {
            setNeedsGatewaySelection(true);
            return;
          }
        } else {
          // Manual / zero-amount renew — already activated
          setSelectingPlan(null);
          setNeedsGatewaySelection(false);
          setAvailableGateways([]);
          await fetchSubscriptionPlans();
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
        amount: selectingPlan.price_monthly * selectedMonths,
        provider,
        callback_url: callbackUrlForProvider(provider)
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

      setSelectingPlan(null);
      setNeedsGatewaySelection(false);
      setAvailableGateways([]);
      await fetchSubscriptionPlans();
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

  const currentPlan = currentSub
    ? plans.find(
        (p) =>
          p.name === currentSub.plan_name || p.slug === currentSub.plan_name
      )
    : null;
  const popularIndex = Math.floor(plans.length / 2);

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
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
      <div className="fade-in-up flex-1 space-y-8 p-6">
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
        <DialogContent className="sm:max-w-md">
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

  if (isPlatformAdmin) {
    return (
      <div className="fade-in-up flex-1 space-y-6 p-6">
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
          <DialogContent className="sm:max-w-md">
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
    <div className="fade-in-up flex-1 space-y-6 p-6">
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
          <PlansTabScopeHeader
            scope="platform"
            title={t('plans.platformTabTitle')}
            description={t('plans.platformTabDescription')}
          />
          <CurrentSubscriptionBanner
            currentSub={currentSub}
            currentPlan={currentPlan}
            t={t}
          />

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
            <div className="stagger-children grid gap-5 sm:grid-cols-3">
              {plans.map((plan, i) => {
                const isPopular = i === popularIndex && plans.length >= 2;
                const isCurrent = currentPlan?.id === plan.id;
                const price =
                  period === 'yearly' && plan.price_yearly
                    ? plan.price_yearly
                    : plan.price_monthly;
                return (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={plan}
                    isPopular={isPopular}
                    isCurrent={isCurrent}
                    price={price}
                    period={period}
                    canSelect={canManagePlan}
                    onSelect={() => !isCurrent && openSelectPlan(plan)}
                    t={t}
                  />
                );
              })}
            </div>
          )}

          <div className="rounded-2xl border bg-muted/40 p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t('plans.needMoreTitle')}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t('plans.needMoreDesc')}
                </p>
              </div>
              <Button variant="outline" className="shrink-0">
                {t('plans.contactSales')}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="academy" className="pt-4">
          <PlansTabScopeHeader
            scope="academy"
            title={t('plans.academyTabTitle')}
            description={t('plans.academyTabDescription')}
          />
          {academyPlansPanel}
        </TabsContent>
      </Tabs>

      {selectingPlan && (
        <Dialog open onOpenChange={(o) => !o && setSelectingPlan(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('plans.confirmChangePlan')}</DialogTitle>
              <DialogDescription>
                {t('plans.confirmChangePlanDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">
                  {t('plans.choosePlan')}
                </p>
                <p className="mt-1 text-lg font-bold">{selectingPlan.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(selectingPlan.price_monthly)}{' '}
                  {t('plans.pricePerMonth')}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t('plans.subscriptionPeriod')}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PERIOD_OPTIONS.map(({ months, key }) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setSelectedMonths(months)}
                      className={cn(
                        'rounded-xl border px-2 py-2.5 text-sm font-medium transition-all duration-150',
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
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-sm font-medium">
                  {t('plans.totalPrice')}
                </span>
                <span className="font-mono text-xl font-bold">
                  {formatPrice(selectingPlan.price_monthly * selectedMonths)}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    {t('plans.toman')}
                  </span>
                </span>
              </div>
              {(needsGatewaySelection || availableGateways.length > 1) && (
                <div className="space-y-2">
                  <Label>{t('plans.selectGateway')}</Label>
                  <div className="grid gap-2">
                    {availableGateways.map((gw) => {
                      const provider = gw.provider as 'SAMAN_SEP' | 'MELLAT_BP';
                      return (
                        <button
                          key={gw.provider}
                          type="button"
                          onClick={() => setSelectedGateway(provider)}
                          className={cn(
                            'rounded-xl border px-3 py-2.5 text-start text-sm font-medium transition-all duration-150',
                            selectedGateway === provider
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-card text-foreground hover:border-primary/40'
                          )}
                        >
                          {gw.display_name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectingPlan(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleChangePlan}
                disabled={
                  isChanging ||
                  (needsGatewaySelection &&
                    availableGateways.length > 1 &&
                    !selectedGateway)
                }
              >
                {isChanging && (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                {t('plans.confirmChange')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {sharedDialogs}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function BillingPeriodToggle({
  period,
  setPeriod,
  t
}: {
  period: 'monthly' | 'yearly';
  setPeriod: (p: 'monthly' | 'yearly') => void;
  t: (key: string) => string;
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1">
      {(['monthly', 'yearly'] as const).map((p) => (
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
  );
}

function CurrentSubscriptionBanner({
  currentSub,
  currentPlan,
  t
}: {
  currentSub: AcademySubscription | null;
  currentPlan: SubscriptionPlanData | null | undefined;
  t: (key: string) => string;
}) {
  if (!currentSub) return null;
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{currentSub.plan_name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  currentSub.status === 'ACTIVE'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {currentSub.status === 'ACTIVE'
                  ? t('plans.subscriptionActive')
                  : t('plans.subscriptionExpired')}
              </span>
              {currentSub.expires_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t('plans.expiresAt')}{' '}
                  {new Date(currentSub.expires_at).toLocaleDateString('fa-IR')}
                </span>
              )}
            </div>
          </div>
        </div>

        {currentPlan && (
          <div className="flex gap-5 text-sm">
            {currentSub.students_count !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-mono font-semibold text-foreground">
                  {currentSub.students_count.toLocaleString('fa-IR')}
                </span>
                <span className="text-xs">{t('plans.studentsUsed')}</span>
              </div>
            )}
            {currentSub.storage_used_gb !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                <span className="font-mono font-semibold text-foreground">
                  {formatStorage(currentSub.storage_used_gb)}
                </span>
                <span className="text-xs">
                  / {formatStorage(currentPlan.storage_limit_gb)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {currentPlan && currentSub.storage_used_gb !== undefined && (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('plans.storageUsed')}</span>
            <span>
              {formatStorage(currentSub.storage_used_gb)} /{' '}
              {formatStorage(currentPlan.storage_limit_gb)}
            </span>
          </div>
          <Progress
            value={Math.min(
              (currentSub.storage_used_gb / currentPlan.storage_limit_gb) * 100,
              100
            )}
            className="h-1.5"
          />
        </div>
      )}
    </div>
  );
}

function SubscriptionPlanCard({
  plan,
  isPopular,
  isCurrent,
  price,
  period,
  canSelect,
  onSelect,
  t
}: {
  plan: SubscriptionPlanData;
  isPopular: boolean;
  isCurrent: boolean;
  price: number;
  period: 'monthly' | 'yearly';
  canSelect: boolean;
  onSelect: () => void;
  t: (key: string) => string;
}) {
  const features = plan.features ?? [];
  return (
    <div
      className={cn(
        'relative rounded-2xl border p-7 transition-all duration-200',
        isPopular
          ? '-translate-y-1 border-foreground bg-foreground text-background shadow-xl'
          : 'border-border bg-card hover:shadow-md'
      )}
    >
      {isPopular && (
        <span className="absolute end-3.5 top-3.5 rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-semibold text-primary-foreground">
          {t('plans.popular')}
        </span>
      )}
      <div
        className={cn(
          'mb-2 text-xs font-semibold uppercase tracking-widest',
          isPopular ? 'text-background/40' : 'text-muted-foreground/50'
        )}
      >
        {plan.slug}
      </div>
      <h2
        className={cn(
          'text-[26px] font-bold tracking-tight',
          isPopular ? 'text-background' : 'text-foreground'
        )}
      >
        {plan.name}
      </h2>
      <div className="mb-5 mt-4 flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-mono text-[34px] font-extrabold tracking-tight',
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
          {period === 'yearly'
            ? t('plans.pricePerYear')
            : t('plans.pricePerMonth')}
        </span>
      </div>

      {canSelect && (
        <button
          type="button"
          disabled={isCurrent}
          onClick={onSelect}
          className={cn(
            'mb-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150',
            isCurrent ? 'cursor-default opacity-60' : 'active:scale-[0.99]',
            isPopular
              ? 'bg-primary text-white hover:opacity-90'
              : 'bg-foreground text-background hover:opacity-85'
          )}
        >
          {isCurrent ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              {t('plans.currentPlan')}
            </span>
          ) : (
            t('plans.choosePlan')
          )}
        </button>
      )}

      {features.length > 0 && (
        <ul className="space-y-2.5">
          {features.map((feature, fi) => (
            <li key={fi} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span
                className={cn(
                  isPopular ? 'text-background/90' : 'text-foreground/75'
                )}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      )}
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
  period: 'monthly' | 'yearly';
  setPeriod: (p: 'monthly' | 'yearly') => void;
  popularIndex: number;
  onOpenCreate: () => void;
  onEdit: (plan: SubscriptionPlanData) => void;
  onDelete: (plan: SubscriptionPlanData) => void;
  onToggleActive: (plan: SubscriptionPlanData) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BillingPeriodToggle period={period} setPeriod={setPeriod} t={t} />
        <Button onClick={onOpenCreate} size="sm">
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
        <div className="stagger-children grid gap-5 sm:grid-cols-3">
          {plans.map((plan, i) => {
            const isPopular = i === popularIndex && plans.length >= 2;
            const price =
              period === 'yearly' && plan.price_yearly
                ? plan.price_yearly
                : plan.price_monthly;
            const features = plan.features ?? [];
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-2xl border p-7 transition-all duration-200',
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
                  {t('plans.sortOrder')} {plan.sort_order}
                </div>
                <h2
                  className={cn(
                    'text-[24px] font-bold tracking-tight',
                    isPopular ? 'text-background' : 'text-foreground'
                  )}
                >
                  {plan.name}
                </h2>

                <div className="mb-5 mt-4 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      'font-mono text-[32px] font-extrabold tracking-tight',
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
                    {period === 'yearly'
                      ? t('plans.pricePerYear')
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
