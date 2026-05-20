'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import {
  HardDrive,
  Zap,
  Crown,
  Pencil,
  Plus,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/status-badge';
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

const PLAN_ACCENT_COLORS = [
  {
    border: 'border-violet-500/30',
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
  },
  {
    border: 'border-emerald-500/30',
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  },
  {
    border: 'border-amber-500/30',
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
  },
  {
    border: 'border-cyan-500/30',
    icon: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
  }
];

function formatStorage(gb: number) {
  return gb >= 1000 ? `${(gb / 1000).toFixed(0)} TB` : `${gb} GB`;
}

function formatPrice(price: number) {
  return price.toLocaleString();
}

export default function PlansPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const isPlatformAdmin =
    user?.role === 'ADMIN' && (user?.isAdminProfile || user?.platformLevel);

  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [currentSub, setCurrentSub] = useState<AcademySubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanData | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<PlanFormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // ADMIN → /platform-settings/plans (full list, CRUD)
      // Others → /platform-settings/plans/active (no auth guard, read-only)
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openCreate() {
    setEditingPlan(null);
    setForm(DEFAULT_FORM);
    setIsDialogOpen(true);
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
    setIsDialogOpen(true);
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

      setIsDialogOpen(false);
      await fetchData();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSaving(false);
    }
  }

  const currentPlan = currentSub
    ? plans.find(
        (p) =>
          p.name === currentSub.plan_name || p.slug === currentSub.plan_name
      )
    : null;

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6">
      <PageHeader
        title={t('plans.title') || 'Plans'}
        description={
          isPlatformAdmin
            ? 'Manage platform subscription plans available to academies.'
            : 'Your current plan and available upgrade options.'
        }
        badge="Plans"
      >
        {isPlatformAdmin && (
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Button>
        )}
      </PageHeader>

      {/* Current Subscription Banner (academy admins only) */}
      {!isPlatformAdmin && currentSub && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{currentSub.plan_name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <StatusBadge
                      status={
                        currentSub.status === 'ACTIVE' ? 'active' : 'inactive'
                      }
                      label={currentSub.status}
                    />
                    {currentSub.expires_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires{' '}
                        {new Date(currentSub.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {currentPlan && (
                <div className="flex gap-6 text-sm">
                  {currentSub.students_count !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {currentSub.students_count}
                      </p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                  )}
                  {currentSub.storage_used_gb !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {formatStorage(currentSub.storage_used_gb)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        of {formatStorage(currentPlan.storage_limit_gb)} used
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {currentPlan && currentSub.storage_used_gb !== undefined && (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Storage usage</span>
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
          </CardContent>
        </Card>
      )}

      {/* Plan Cards */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {isPlatformAdmin ? 'All Subscription Plans' : 'Available Plans'}
        </h2>

        {plans.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-muted p-4">
                <Zap className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No plans configured yet.
              </p>
              {isPlatformAdmin && (
                <Button onClick={openCreate} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Plan
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, i) => {
              const accent = PLAN_ACCENT_COLORS[i % PLAN_ACCENT_COLORS.length];
              const isCurrent = currentPlan?.id === plan.id;
              const features = plan.features ?? [];

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative overflow-hidden border-2 transition-all duration-200 hover:shadow-md',
                    isCurrent ? 'border-primary/50' : accent.border
                  )}
                >
                  {isCurrent && (
                    <div className="absolute right-3 top-3">
                      <Badge className="bg-primary/10 text-xs text-primary">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  {!plan.is_active && (
                    <div className="absolute left-3 top-3">
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-start justify-between">
                      <div className={cn('rounded-xl p-2.5', accent.icon)}>
                        <Crown className="h-5 w-5" />
                      </div>
                      {isPlatformAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardTitle className="mt-3 text-xl">{plan.name}</CardTitle>
                    <CardDescription className="font-mono text-xs text-muted-foreground">
                      {plan.slug}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    {/* Pricing */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {formatPrice(plan.price_monthly)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /mo
                        </span>
                      </div>
                      {plan.price_yearly && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          {formatPrice(plan.price_yearly)}/yr — save{' '}
                          {Math.round(
                            ((plan.price_monthly * 12 - plan.price_yearly) /
                              (plan.price_monthly * 12)) *
                              100
                          )}
                          %
                        </p>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="space-y-2.5 rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatStorage(plan.storage_limit_gb)} storage
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <ul className="space-y-1.5">
                        {features.slice(0, 5).map((feature, fi) => (
                          <li
                            key={fi}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {features.length > 5 && (
                          <li className="text-xs text-muted-foreground">
                            +{features.length - 5} more features
                          </li>
                        )}
                      </ul>
                    )}

                    {/* Action */}
                    {!isPlatformAdmin && (
                      <Button
                        className="w-full"
                        variant={isCurrent ? 'secondary' : 'default'}
                        disabled={isCurrent}
                      >
                        {isCurrent ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Current Plan
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Upgrade to {plan.name}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit / Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Pro"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price_monthly: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Yearly Price</Label>
                <Input
                  type="number"
                  value={form.price_yearly}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price_yearly: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, storage_limit_gb: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sort_order: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Features (one per line)</Label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.features}
                onChange={(e) =>
                  setForm((f) => ({ ...f, features: e.target.value }))
                }
                placeholder="Unlimited courses&#10;Priority support&#10;Custom domain"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, is_active: v }))
                }
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !form.name}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
