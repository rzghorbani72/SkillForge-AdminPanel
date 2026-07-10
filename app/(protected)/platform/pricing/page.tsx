'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2, Pencil, X, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriceInput } from '@/components/ui/price-input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin } from '@/lib/roles';
import { ErrorHandler } from '@/lib/error-handler';
import {
  apiClient,
  PlatformSettingsData,
  SubscriptionPlanData
} from '@/lib/api';
import {
  PlanFormFields,
  type PlanFormState
} from '@/components/platform/pricing/plan-form-fields';
import {
  DEFAULT_LIMITS,
  formatIRR,
  formatToman,
  fromPercent,
  irrToToman,
  tomanToIrr,
  toPercent
} from '@/components/platform/pricing/pricing-helpers';

const emptyPlanForm = (): PlanFormState => ({
  name: '',
  slug: '',
  price_monthly_toman: '0',
  price_yearly_toman: '',
  commission_rate: '',
  storage_limit_gb: '200',
  features: '',
  is_active: true,
  is_most_popular: false,
  annual_months_included: '0',
  sort_order: '0',
  limits: { ...DEFAULT_LIMITS }
});

const planToForm = (p: SubscriptionPlanData): PlanFormState => ({
  name: p.name,
  slug: p.slug,
  price_monthly_toman: String(irrToToman(p.price_monthly)),
  price_yearly_toman:
    p.price_yearly != null ? String(irrToToman(p.price_yearly)) : '',
  commission_rate:
    p.commission_rate != null ? String(toPercent(p.commission_rate)) : '',
  storage_limit_gb: String(p.storage_limit_gb),
  features: (p.features ?? []).join('\n'),
  is_active: p.is_active,
  is_most_popular: p.is_most_popular ?? false,
  annual_months_included: String(p.annual_months_included ?? 0),
  sort_order: String(p.sort_order),
  limits: { ...DEFAULT_LIMITS, ...(p.limits ?? {}) }
});

export default function PlatformPricingPage() {
  const { user, isLoading } = useAuthUser();
  const isPlatformAdminUser = isPlatformAdmin(user);

  // -- global settings state
  const [settings, setSettings] = useState<PlatformSettingsData | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    vat_rate: '',
    commission_rate: '',
    teacher_share_rate: '',
    storage_overage_fee_irr: '',
    subscription_grace_days: '',
    subscription_reminder_days: '',
    payment_release_phase: '',
    legal_entity_name: '',
    vat_registration_no: '',
    economic_code: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // -- plans state
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | 'new' | null>(
    null
  );
  const [planForm, setPlanForm] = useState<PlanFormState>(emptyPlanForm());
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // ── load ──────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    if (!isPlatformAdminUser) return;
    try {
      const [s, p] = await Promise.all([
        apiClient.getPlatformSettings(),
        apiClient.getSubscriptionPlans()
      ]);
      setSettings(s);
      setSettingsForm({
        vat_rate: String(toPercent(s.vat_rate)),
        commission_rate: String(toPercent(s.commission_rate)),
        teacher_share_rate: String(toPercent(s.teacher_share_rate)),
        storage_overage_fee_irr: String(s.storage_overage_fee_irr),
        subscription_grace_days: String(s.subscription_grace_days),
        subscription_reminder_days: String(s.subscription_reminder_days),
        payment_release_phase: s.payment_release_phase,
        legal_entity_name: s.legal_entity_name ?? '',
        vat_registration_no: s.vat_registration_no ?? '',
        economic_code: s.economic_code ?? ''
      });
      setPlans(Array.isArray(p) ? p : []);
    } catch {
      ErrorHandler.showError('Failed to load platform settings');
    }
  }, [isPlatformAdminUser]);

  useEffect(() => {
    if (!isLoading) loadAll();
  }, [isLoading, loadAll]);

  // ── save settings ─────────────────────────────────────────────────────────

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await apiClient.updatePlatformSettings({
        vat_rate: fromPercent(Number(settingsForm.vat_rate)),
        commission_rate: fromPercent(Number(settingsForm.commission_rate)),
        teacher_share_rate: fromPercent(
          Number(settingsForm.teacher_share_rate)
        ),
        storage_overage_fee_irr: Number(settingsForm.storage_overage_fee_irr),
        subscription_grace_days: Number(settingsForm.subscription_grace_days),
        subscription_reminder_days: Number(
          settingsForm.subscription_reminder_days
        ),
        payment_release_phase: settingsForm.payment_release_phase,
        legal_entity_name: settingsForm.legal_entity_name || null,
        vat_registration_no: settingsForm.vat_registration_no || null,
        economic_code: settingsForm.economic_code || null
      } as Partial<PlatformSettingsData>);
      ErrorHandler.showSuccess('Platform settings saved');
      await loadAll();
    } catch {
      ErrorHandler.showError('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── plan CRUD ─────────────────────────────────────────────────────────────

  const startNewPlan = () => {
    setPlanForm(emptyPlanForm());
    setEditingPlanId('new');
  };

  const startEditPlan = (plan: SubscriptionPlanData) => {
    setPlanForm(planToForm(plan));
    setEditingPlanId(plan.id);
  };

  const cancelPlan = () => {
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm());
  };

  const buildPlanPayload = () => {
    const featuresArr = planForm.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    return {
      name: planForm.name,
      slug: planForm.slug,
      price_monthly: tomanToIrr(Number(planForm.price_monthly_toman) || 0),
      price_yearly: planForm.price_yearly_toman
        ? tomanToIrr(Number(planForm.price_yearly_toman))
        : undefined,
      commission_rate: planForm.commission_rate
        ? fromPercent(Number(planForm.commission_rate))
        : undefined,
      storage_limit_gb: Number(planForm.storage_limit_gb),
      features: featuresArr.length ? featuresArr : undefined,
      is_active: planForm.is_active,
      is_most_popular: planForm.is_most_popular,
      annual_months_included: Number(planForm.annual_months_included) || 0,
      sort_order: Number(planForm.sort_order),
      limits: planForm.limits
    };
  };

  const handleSavePlan = async () => {
    setSavingPlan(true);
    try {
      if (editingPlanId === 'new') {
        await apiClient.createSubscriptionPlan(
          buildPlanPayload() as Parameters<
            typeof apiClient.createSubscriptionPlan
          >[0]
        );
        ErrorHandler.showSuccess('Plan created');
      } else if (editingPlanId) {
        await apiClient.updateSubscriptionPlan(
          editingPlanId,
          buildPlanPayload()
        );
        ErrorHandler.showSuccess('Plan updated');
      }
      cancelPlan();
      await loadAll();
    } catch {
      ErrorHandler.showError('Failed to save plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    setDeletingPlanId(id);
    try {
      await apiClient.deleteSubscriptionPlan(id);
      ErrorHandler.showSuccess('Plan deleted');
      await loadAll();
    } catch {
      ErrorHandler.showError('Failed to delete plan');
    } finally {
      setDeletingPlanId(null);
    }
  };

  // ── access guard ──────────────────────────────────────────────────────────

  if (isLoading) return <div className="flex-1 p-6" />;

  if (!isPlatformAdminUser) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Only platform administrators can manage pricing settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Platform Pricing & Commission
        </h1>
        <p className="text-muted-foreground">
          Manage VAT, platform commission, teacher revenue share, and
          subscription plan pricing. Changes take effect on the next request
          (60-second cache).
        </p>
      </div>

      {/* ── Global financial rates ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Rates</CardTitle>
          <CardDescription>
            These rates apply to all payment settlements and financial reports.
            Enter values as percentages (e.g. 9 = 9%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>VAT Rate (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={settingsForm.vat_rate}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, vat_rate: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Current Iran VAT is 9%
              </p>
            </div>
            <div className="space-y-2">
              <Label>Platform Commission (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={settingsForm.commission_rate}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    commission_rate: e.target.value
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Default take-rate per sale
              </p>
            </div>
            <div className="space-y-2">
              <Label>Teacher Revenue Share (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={settingsForm.teacher_share_rate}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    teacher_share_rate: e.target.value
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Portion paid to instructor
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Storage Overage Fee (IRR/GB)</Label>
              <PriceInput
                value={settingsForm.storage_overage_fee_irr}
                onChange={(raw) =>
                  setSettingsForm({
                    ...settingsForm,
                    storage_overage_fee_irr: raw
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Subscription Grace Days</Label>
              <Input
                type="number"
                min={0}
                value={settingsForm.subscription_grace_days}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    subscription_grace_days: e.target.value
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Subscription Reminder Days (before expiry)</Label>
              <Input
                type="number"
                min={0}
                value={settingsForm.subscription_reminder_days}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    subscription_reminder_days: e.target.value
                  })
                }
              />
            </div>
          </div>

          <div className="max-w-xs space-y-2">
            <Label>Payment Release Phase</Label>
            <Input
              value={settingsForm.payment_release_phase}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  payment_release_phase: e.target.value
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              e.g. IRAN_PAYPING_ONLY | ALL_GATEWAYS
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Iran legal / tax metadata ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Iran Tax Registration</CardTitle>
          <CardDescription>
            Used in official settlement statements and tax reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Legal Entity Name</Label>
            <Input
              value={settingsForm.legal_entity_name}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  legal_entity_name: e.target.value
                })
              }
              placeholder="شرکت مثال"
            />
          </div>
          <div className="space-y-2">
            <Label>VAT Registration No</Label>
            <Input
              value={settingsForm.vat_registration_no}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  vat_registration_no: e.target.value
                })
              }
              placeholder="12345678901"
            />
          </div>
          <div className="space-y-2">
            <Label>Economic Code</Label>
            <Input
              value={settingsForm.economic_code}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  economic_code: e.target.value
                })
              }
              placeholder="10860287511"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={savingSettings}>
          <Save className="mr-2 h-4 w-4" />
          {savingSettings ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>

      {/* ── Subscription Plans ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Define plans sold to academy owners. Commission rate overrides the
              global rate per plan.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={startNewPlan}
            disabled={editingPlanId !== null}
          >
            <Plus className="mr-2 h-4 w-4" /> New Plan
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ── inline new/edit form ────────────────────────────────────── */}
          {editingPlanId !== null && (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold">
                {editingPlanId === 'new' ? 'New Plan' : 'Edit Plan'}
              </h3>
              <PlanFormFields
                form={planForm}
                isNew={editingPlanId === 'new'}
                onChange={setPlanForm}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={cancelPlan}>
                  <X className="mr-1 h-3 w-3" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePlan}
                  disabled={savingPlan}
                >
                  <Check className="mr-1 h-3 w-3" />
                  {savingPlan ? 'Saving…' : 'Save Plan'}
                </Button>
              </div>
            </div>
          )}

          {/* ── plans table ─────────────────────────────────────────────── */}
          {plans.length === 0 && editingPlanId === null ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No subscription plans yet. Click &quot;New Plan&quot; to create
              one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Annual</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div>{plan.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {plan.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{formatToman(irrToToman(plan.price_monthly))}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatIRR(plan.price_monthly)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.price_yearly != null ? (
                        <>
                          <div>
                            {formatToman(irrToToman(plan.price_yearly))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatIRR(plan.price_yearly)}
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.commission_rate != null ? (
                        `${toPercent(plan.commission_rate)}%`
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          global
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{plan.storage_limit_gb} GB</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditPlan(plan)}
                        disabled={editingPlanId !== null}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={
                          deletingPlanId === plan.id || editingPlanId !== null
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── current effective rates summary ─────────────────────────────── */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Effective Rates Summary</CardTitle>
            <CardDescription>
              What the payment engine currently uses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">VAT</dt>
                <dd className="font-semibold">
                  {toPercent(settings.vat_rate)}%
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Commission</dt>
                <dd className="font-semibold">
                  {toPercent(settings.commission_rate)}%
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Teacher Share</dt>
                <dd className="font-semibold">
                  {toPercent(settings.teacher_share_rate)}%
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Platform Net</dt>
                <dd className="font-semibold">
                  {toPercent(
                    settings.commission_rate -
                      settings.commission_rate * settings.teacher_share_rate
                  )}
                  %
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Grace Period</dt>
                <dd className="font-semibold">
                  {settings.subscription_grace_days} days
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Reminder</dt>
                <dd className="font-semibold">
                  {settings.subscription_reminder_days} days before
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Overage Fee</dt>
                <dd className="font-semibold">
                  {formatIRR(settings.storage_overage_fee_irr)}/GB
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment Phase</dt>
                <dd className="text-xs font-semibold">
                  {settings.payment_release_phase}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
