'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Zap,
  Pencil,
  Plus,
  Check,
  CheckCircle2,
  Loader2,
  Trash2,
  Crown,
  Calendar,
  HardDrive,
  Users,
  AlertTriangle,
  Eye,
  BookOpen,
  Clock
} from 'lucide-react';
import { apiClient, SubscriptionPlanData } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { cn } from '@/lib/utils';

interface AcademySubscription {
  id: number;
  plan_name: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  storage_used_gb?: number;
  students_count?: number;
}

interface AcademyPlanData {
  id: number;
  academy_id: number;
  kind: 'SUBSCRIPTION' | 'PACKAGE';
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlanFormData {
  name: string;
  slug: string;
  price_monthly: string;
  price_yearly: string;
  storage_limit_gb: string;
  features: string;
  is_active: boolean;
  sort_order: string;
}

interface AcademyPlanFormData {
  kind: 'SUBSCRIPTION' | 'PACKAGE';
  name: string;
  description: string;
  price: string;
  duration_days: string;
  is_active: boolean;
}

const DEFAULT_FORM: PlanFormData = {
  name: '',
  slug: '',
  price_monthly: '0',
  price_yearly: '',
  storage_limit_gb: '50',
  features: '',
  is_active: true,
  sort_order: '0'
};

const DEFAULT_ACADEMY_PLAN_FORM: AcademyPlanFormData = {
  kind: 'SUBSCRIPTION',
  name: '',
  description: '',
  price: '0',
  duration_days: '',
  is_active: true
};

const PERIOD_OPTIONS = [
  { months: 1, key: 'months1' },
  { months: 3, key: 'months3' },
  { months: 6, key: 'months6' },
  { months: 12, key: 'months12' }
] as const;

function formatPrice(price: number) {
  return price.toLocaleString('fa-IR');
}

function formatStorage(gb: number) {
  return gb >= 1000 ? `${(gb / 1000).toFixed(0)} TB` : `${gb} GB`;
}

export default function PlansPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();

  const isPlatformAdmin =
    user?.role === 'ADMIN' && (user?.isAdminProfile || user?.platformLevel);
  const canManagePlan =
    !isPlatformAdmin && (user?.role === 'ADMIN' || user?.role === 'MANAGER');
  const isTeacher = user?.role === 'TEACHER';
  const canManageAcademyPlans = isPlatformAdmin || canManagePlan;

  // ── Platform subscription plans state ─────────────────────────────────────
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
  const [form, setForm] = useState<PlanFormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlanData | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectingPlan, setSelectingPlan] =
    useState<SubscriptionPlanData | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isChanging, setIsChanging] = useState(false);

  // ── Academy plans state ────────────────────────────────────────────────────
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

  // ── Data fetching ──────────────────────────────────────────────────────────

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
    fetchSubscriptionPlans();
  }, [fetchSubscriptionPlans]);

  // ── Platform subscription plan handlers ────────────────────────────────────

  function openCreate() {
    setEditingPlan(null);
    setForm(DEFAULT_FORM);
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

  async function handleSave() {
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

  async function handleDelete() {
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

  async function handleToggleActive(plan: SubscriptionPlanData) {
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
  }

  async function handleChangePlan() {
    if (!selectingPlan) return;
    try {
      setIsChanging(true);
      await apiClient.renewCurrentAcademySubscription({
        plan_name: selectingPlan.slug,
        months: selectedMonths,
        amount: selectingPlan.price_monthly * selectedMonths
      });
      setSelectingPlan(null);
      await fetchSubscriptionPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsChanging(false);
    }
  }

  // ── Academy plan handlers ──────────────────────────────────────────────────

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

  // ── Derived ────────────────────────────────────────────────────────────────

  const currentPlan = currentSub
    ? plans.find(
        (p) =>
          p.name === currentSub.plan_name || p.slug === currentSub.plan_name
      )
    : null;

  const popularIndex = Math.floor(plans.length / 2);

  // ── Loading ────────────────────────────────────────────────────────────────

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

  // ── Teacher View ──────────────────────────────────────────────────────────

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

  // ── Academy Plans Tab Content ──────────────────────────────────────────────

  const academyPlansContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('plans.subtitle')}</p>
        {canManageAcademyPlans && (
          <Button onClick={openCreateAcademyPlan} size="sm">
            <Plus className="me-2 h-4 w-4" />
            {t('plans.createAcademyPlan')}
          </Button>
        )}
      </div>

      {isAcademyPlansLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : academyPlans.length === 0 ? (
        <div className="rounded-2xl border bg-card py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('plans.noAcademyPlans')}
          </p>
          {canManageAcademyPlans && (
            <Button
              onClick={openCreateAcademyPlan}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Plus className="me-2 h-4 w-4" />
              {t('plans.createFirstAcademyPlan')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {academyPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'flex items-center justify-between rounded-xl border bg-card px-5 py-4 transition-all',
                !plan.is_active && 'opacity-60'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  {plan.kind === 'SUBSCRIPTION' ? (
                    <Clock className="h-5 w-5 text-primary" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{plan.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {plan.kind === 'SUBSCRIPTION'
                        ? t('plans.kindSubscription')
                        : t('plans.kindPackage')}
                    </Badge>
                    {!plan.is_active && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-muted-foreground"
                      >
                        {t('plans.inactive')}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {formatPrice(plan.price)} {plan.currency}
                    </span>
                    {plan.kind === 'SUBSCRIPTION' && plan.duration_days && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {plan.duration_days}d
                      </span>
                    )}
                    {plan.description && (
                      <span className="max-w-[200px] truncate">
                        {plan.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={plan.is_active}
                  onCheckedChange={() => handleToggleAcademyPlanActive(plan)}
                />
                <button
                  type="button"
                  aria-label={`Edit ${plan.name}`}
                  onClick={() => openEditAcademyPlan(plan)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${plan.name}`}
                  onClick={() => setDeletingAcademyPlan(plan)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Platform Admin View ────────────────────────────────────────────────────

  if (isPlatformAdmin) {
    return (
      <div className="fade-in-up flex-1 space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {t('plans.badge')}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('plans.title')}
            </h1>
          </div>
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

          {/* Platform Plans tab */}
          <TabsContent value="platform" className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1">
                <button
                  type="button"
                  onClick={() => setPeriod('monthly')}
                  className={cn(
                    'rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150',
                    period === 'monthly'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('plans.monthly')}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('yearly')}
                  className={cn(
                    'rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150',
                    period === 'yearly'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('plans.yearly')}
                </button>
              </div>
              <Button onClick={openCreate} size="sm">
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
                  onClick={openCreate}
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
                  const features = plan.features ?? [];
                  const price =
                    period === 'yearly' && plan.price_yearly
                      ? plan.price_yearly
                      : plan.price_monthly;

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
                          onClick={() => openEdit(plan)}
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
                          onClick={() => setDeletingPlan(plan)}
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
                            isPopular
                              ? 'text-background/50'
                              : 'text-muted-foreground'
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
                          isPopular
                            ? 'text-background/70'
                            : 'text-muted-foreground'
                        )}
                      >
                        <HardDrive className="h-4 w-4 shrink-0" />
                        {formatStorage(plan.storage_limit_gb)}{' '}
                        {t('plans.storage')}
                      </div>

                      {features.length > 0 && (
                        <ul className="space-y-2.5">
                          {features.map((feature, fi) => (
                            <li
                              key={fi}
                              className="flex items-start gap-2.5 text-sm"
                            >
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
                          isPopular
                            ? 'border-background/10'
                            : 'border-border/50'
                        )}
                      >
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isPopular
                              ? 'text-background/60'
                              : 'text-muted-foreground'
                          )}
                        >
                          {t('plans.toggleActive')}
                        </span>
                        <Switch
                          checked={plan.is_active}
                          onCheckedChange={() => handleToggleActive(plan)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Academy Plans tab */}
          <TabsContent value="academy" className="pt-4">
            {academyPlansContent}
          </TabsContent>
        </Tabs>

        {/* Platform plan form dialog */}
        <PlanFormDialog
          open={isFormOpen}
          editingPlan={editingPlan}
          form={form}
          isSaving={isSaving}
          onClose={() => setIsFormOpen(false)}
          onChange={(field, value) =>
            setForm((f) => ({ ...f, [field]: value }))
          }
          onSave={handleSave}
          t={t}
        />

        {/* Platform plan delete dialog */}
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
                onClick={handleDelete}
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

        {/* Academy plan form dialog */}
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

        {/* Academy plan delete dialog */}
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
      </div>
    );
  }

  // ── Manager / Academy Admin View ───────────────────────────────────────────

  return (
    <div className="fade-in-up flex-1 space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {t('plans.badge')}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('plans.title')}
          </h1>
        </div>
      </div>

      <Tabs
        defaultValue="subscription"
        onValueChange={(v) => {
          if (v === 'academy') fetchAcademyPlans();
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

        {/* My Subscription tab */}
        <TabsContent value="subscription" className="space-y-6 pt-4">
          {/* Current subscription banner */}
          {currentSub && (
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
                          {new Date(currentSub.expires_at).toLocaleDateString(
                            'fa-IR'
                          )}
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
                        <span className="text-xs">
                          {t('plans.studentsUsed')}
                        </span>
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
                      (currentSub.storage_used_gb /
                        currentPlan.storage_limit_gb) *
                        100,
                      100
                    )}
                    className="h-1.5"
                  />
                </div>
              )}
            </div>
          )}

          {/* Billing toggle */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
                  period === 'monthly'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('plans.monthly')}
              </button>
              <button
                type="button"
                onClick={() => setPeriod('yearly')}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
                  period === 'yearly'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('plans.yearly')}
              </button>
            </div>
          </div>

          {/* Plan cards */}
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
                const features = plan.features ?? [];
                const price =
                  period === 'yearly' && plan.price_yearly
                    ? plan.price_yearly
                    : plan.price_monthly;

                return (
                  <div
                    key={plan.id}
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
                        isPopular
                          ? 'text-background/40'
                          : 'text-muted-foreground/50'
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
                          isPopular
                            ? 'text-background/50'
                            : 'text-muted-foreground'
                        )}
                      >
                        {period === 'yearly'
                          ? t('plans.pricePerYear')
                          : t('plans.pricePerMonth')}
                      </span>
                    </div>

                    {canManagePlan && (
                      <button
                        type="button"
                        disabled={isCurrent}
                        onClick={() => !isCurrent && openSelectPlan(plan)}
                        className={cn(
                          'mb-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150',
                          isCurrent
                            ? 'cursor-default opacity-60'
                            : 'active:scale-[0.99]',
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
                          <li
                            key={fi}
                            className="flex items-start gap-2.5 text-sm"
                          >
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
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact sales */}
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

        {/* Academy Plans tab */}
        <TabsContent value="academy" className="pt-4">
          {academyPlansContent}
        </TabsContent>
      </Tabs>

      {/* Choose subscription plan dialog */}
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
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectingPlan(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleChangePlan} disabled={isChanging}>
                {isChanging && (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                {t('plans.confirmChange')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Academy plan form dialog */}
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

      {/* Academy plan delete dialog */}
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
    </div>
  );
}

// ── Platform subscription plan form dialog ────────────────────────────────────

function PlanFormDialog({
  open,
  editingPlan,
  form,
  isSaving,
  onClose,
  onChange,
  onSave,
  t
}: {
  open: boolean;
  editingPlan: SubscriptionPlanData | null;
  form: PlanFormData;
  isSaving: boolean;
  onClose: () => void;
  onChange: (field: keyof PlanFormData, value: string | boolean) => void;
  onSave: () => void;
  t: (key: string) => string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? `Edit ${editingPlan.name}` : 'Create Plan'}
          </DialogTitle>
          <DialogDescription>
            {editingPlan
              ? 'Update the subscription plan details.'
              : 'Add a new subscription plan to the platform.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Pro"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => onChange('slug', e.target.value)}
                placeholder="pro"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Monthly Price</Label>
              <Input
                type="number"
                value={form.price_monthly}
                onChange={(e) => onChange('price_monthly', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Yearly Price</Label>
              <Input
                type="number"
                value={form.price_yearly}
                onChange={(e) => onChange('price_yearly', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Storage (GB)</Label>
              <Input
                type="number"
                value={form.storage_limit_gb}
                onChange={(e) => onChange('storage_limit_gb', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => onChange('sort_order', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Features (one per line)</Label>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.features}
              onChange={(e) => onChange('features', e.target.value)}
              placeholder={'Unlimited courses\nPriority support\nCustom domain'}
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => onChange('is_active', v)}
            />
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Inactive plans are hidden from academies.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave} disabled={isSaving || !form.name}>
            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {editingPlan ? 'Save Changes' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Academy plan form dialog ──────────────────────────────────────────────────

function AcademyPlanFormDialog({
  open,
  editingPlan,
  form,
  isSaving,
  onClose,
  onChange,
  onSave,
  t
}: {
  open: boolean;
  editingPlan: AcademyPlanData | null;
  form: AcademyPlanFormData;
  isSaving: boolean;
  onClose: () => void;
  onChange: (field: keyof AcademyPlanFormData, value: string | boolean) => void;
  onSave: () => void;
  t: (key: string) => string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPlan
              ? t('plans.editAcademyPlan')
              : t('plans.createAcademyPlan')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t('plans.kindLabel')}</Label>
            <Select
              value={form.kind}
              onValueChange={(v) =>
                onChange('kind', v as 'SUBSCRIPTION' | 'PACKAGE')
              }
              disabled={!!editingPlan}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUBSCRIPTION">
                  {t('plans.kindSubscription')}
                </SelectItem>
                <SelectItem value="PACKAGE">
                  {t('plans.kindPackage')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g. Monthly Access"
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t('plans.descriptionLabel')}</Label>
            <Input
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('plans.priceLabel')}</Label>
              <Input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => onChange('price', e.target.value)}
              />
            </div>
            {form.kind === 'SUBSCRIPTION' && (
              <div className="space-y-1.5">
                <Label>{t('plans.durationDays')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.duration_days}
                  onChange={(e) => onChange('duration_days', e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>
            )}
          </div>

          {editingPlan && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => onChange('is_active', v)}
              />
              <p className="text-sm font-medium">{t('plans.toggleActive')}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave} disabled={isSaving || !form.name}>
            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {editingPlan
              ? t('plans.editAcademyPlan')
              : t('plans.createAcademyPlan')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
