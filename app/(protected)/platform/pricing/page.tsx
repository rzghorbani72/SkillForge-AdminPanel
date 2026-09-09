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
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { useTranslation } from '@/lib/i18n/hooks';
import {
  apiClient,
  type GatewayConfigData,
  type PlatformSettingsData,
  type SubscriptionPlanData
} from '@/lib/api';
import {
  PlanFormFields,
  type PlanFormState
} from '@/components/platform/pricing/plan-form-fields';
import { GatewayTogglesCard } from '@/components/platform/pricing/gateway-toggles-card';
import { CostAssumptionsCard } from '@/components/platform/pricing/cost-assumptions-card';
import { PlanPriceCalculatorCard } from '@/components/platform/pricing/plan-price-calculator-card';
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
  storage_limit_gb: '20',
  features: '',
  is_active: true,
  is_most_popular: false,
  annual_months_included: '0',
  sort_order: '0',
  limits: { ...DEFAULT_LIMITS }
});

const asNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const planToForm = (p: SubscriptionPlanData): PlanFormState => ({
  name: p.name,
  slug: p.slug,
  price_monthly_toman: String(irrToToman(p.price_monthly)),
  price_yearly_toman:
    p.price_yearly != null ? String(irrToToman(p.price_yearly)) : '',
  storage_limit_gb: String(p.storage_limit_gb),
  features: Array.isArray(p.features) ? p.features.join('\n') : '',
  is_active: p.is_active,
  is_most_popular: p.is_most_popular ?? false,
  annual_months_included: String(p.annual_months_included ?? 0),
  sort_order: String(p.sort_order),
  limits: { ...DEFAULT_LIMITS, ...(p.limits ?? {}) }
});

export default function PlatformPricingPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuthUser();
  const isPlatformAdminUser = isPlatformAdmin(user);

  const [settings, setSettings] = useState<PlatformSettingsData | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    vat_rate: '',
    storage_overage_fee_irr: '',
    subscription_grace_days: '',
    subscription_reminder_days: '',
    payment_release_phase: '',
    legal_entity_name: '',
    vat_registration_no: '',
    economic_code: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | 'new' | null>(
    null
  );
  const [planForm, setPlanForm] = useState<PlanFormState>(emptyPlanForm());
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const [gateways, setGateways] = useState<GatewayConfigData[]>([]);
  const [savingGatewayId, setSavingGatewayId] = useState<string | null>(null);

  const applySettings = useCallback((s: PlatformSettingsData) => {
    setSettings(s);
    setSettingsForm({
      vat_rate: String(toPercent(asNumber(s.vat_rate))),
      storage_overage_fee_irr: String(asNumber(s.storage_overage_fee_irr)),
      subscription_grace_days: String(asNumber(s.subscription_grace_days)),
      subscription_reminder_days: String(
        asNumber(s.subscription_reminder_days)
      ),
      payment_release_phase: s.payment_release_phase ?? '',
      legal_entity_name: s.legal_entity_name ?? '',
      vat_registration_no: s.vat_registration_no ?? '',
      economic_code: s.economic_code ?? ''
    });
  }, []);

  const loadGateways = useCallback(async () => {
    try {
      const data = await apiClient.listGatewayConfigs();
      setGateways(data.gateways);
    } catch {
      ErrorHandler.showError(t('pricing.platform.gatewaysLoadFailed'));
    }
  }, [t]);

  const loadAll = useCallback(async () => {
    if (!isPlatformAdminUser) return;

    const [settingsResult, plansResult, gatewaysResult] =
      await Promise.allSettled([
        apiClient.getPlatformSettings(),
        apiClient.getSubscriptionPlans(),
        apiClient.listGatewayConfigs()
      ]);

    if (settingsResult.status === 'fulfilled' && settingsResult.value) {
      applySettings(settingsResult.value);
    } else {
      ErrorHandler.showError(t('pricing.platform.loadFailed'));
    }

    if (plansResult.status === 'fulfilled') {
      const raw = plansResult.value;
      setPlans(Array.isArray(raw) ? raw : []);
    } else {
      ErrorHandler.showError(t('pricing.platform.plansLoadFailed'));
    }

    if (gatewaysResult.status === 'fulfilled') {
      setGateways(gatewaysResult.value.gateways);
    } else {
      ErrorHandler.showError(t('pricing.platform.gatewaysLoadFailed'));
    }
  }, [applySettings, isPlatformAdminUser, t]);

  useEffect(() => {
    if (!isLoading) void loadAll();
  }, [isLoading, loadAll]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await apiClient.updatePlatformSettings({
        vat_rate: fromPercent(Number(settingsForm.vat_rate)),
        commission_rate: 0,
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
      ErrorHandler.showSuccess(t('pricing.platform.saveSettingsSuccess'));
      await loadAll();
    } catch {
      ErrorHandler.showError(t('pricing.platform.saveSettingsFailed'));
    } finally {
      setSavingSettings(false);
    }
  };

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
      commission_rate: 0,
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
        ErrorHandler.showSuccess(t('pricing.platform.planCreated'));
      } else if (editingPlanId) {
        await apiClient.updateSubscriptionPlan(
          editingPlanId,
          buildPlanPayload()
        );
        ErrorHandler.showSuccess(t('pricing.platform.planUpdated'));
      }
      cancelPlan();
      await loadAll();
    } catch {
      ErrorHandler.showError(t('pricing.platform.savePlanFailed'));
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    setDeletingPlanId(id);
    try {
      await apiClient.deleteSubscriptionPlan(id);
      ErrorHandler.showSuccess(t('pricing.platform.planDeleted'));
      await loadAll();
    } catch {
      ErrorHandler.showError(t('pricing.platform.deletePlanFailed'));
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleToggleGateway = async (
    gateway: GatewayConfigData,
    isActive: boolean
  ) => {
    setSavingGatewayId(gateway.id);
    setGateways((prev) =>
      prev.map((g) => (g.id === gateway.id ? { ...g, is_active: isActive } : g))
    );
    try {
      await apiClient.updateGatewayConfig(gateway.id, { is_active: isActive });
      ErrorHandler.showSuccess(t('pricing.platform.gatewaySaved'));
    } catch {
      setGateways((prev) =>
        prev.map((g) =>
          g.id === gateway.id ? { ...g, is_active: gateway.is_active } : g
        )
      );
      ErrorHandler.showError(t('pricing.platform.gatewaySaveFailed'));
    } finally {
      setSavingGatewayId(null);
    }
  };

  if (isLoading) return <div className="flex-1 p-4 sm:p-6" />;

  if (!isPlatformAdminUser) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('pricing.platform.accessRestricted')}</CardTitle>
            <CardDescription>
              {t('pricing.platform.accessRestrictedDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('pricing.platform.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('pricing.platform.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pricing.platform.financialRates')}</CardTitle>
          <CardDescription>
            {t('pricing.platform.financialRatesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('pricing.platform.vatRate')}</Label>
              <NumberInput
                allowDecimal
                value={settingsForm.vat_rate}
                onChange={(raw) =>
                  setSettingsForm({ ...settingsForm, vat_rate: raw })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t('pricing.platform.vatRateHint')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('pricing.platform.overageFee')}</Label>
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
              <Label>{t('pricing.platform.graceDays')}</Label>
              <NumberInput
                value={settingsForm.subscription_grace_days}
                onChange={(raw) =>
                  setSettingsForm({
                    ...settingsForm,
                    subscription_grace_days: raw
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('pricing.platform.reminderDays')}</Label>
              <NumberInput
                value={settingsForm.subscription_reminder_days}
                onChange={(raw) =>
                  setSettingsForm({
                    ...settingsForm,
                    subscription_reminder_days: raw
                  })
                }
              />
            </div>
          </div>

          <div className="max-w-xs space-y-2">
            <Label>{t('pricing.platform.paymentPhase')}</Label>
            <Select
              value={settingsForm.payment_release_phase}
              onValueChange={(value) =>
                setSettingsForm({
                  ...settingsForm,
                  payment_release_phase: value
                })
              }
            >
              <SelectTrigger aria-label={t('pricing.platform.paymentPhase')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IRAN_PAYPING_ONLY">
                  {t('pricing.platform.paymentPhasePaypingOnly')}
                </SelectItem>
                <SelectItem value="ALL_GATEWAYS">
                  {t('pricing.platform.paymentPhaseAllGateways')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('pricing.platform.paymentPhaseHint')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('pricing.platform.taxTitle')}</CardTitle>
          <CardDescription>{t('pricing.platform.taxDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('pricing.platform.legalEntityName')}</Label>
            <Input
              value={settingsForm.legal_entity_name}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  legal_entity_name: e.target.value
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('pricing.platform.vatRegNo')}</Label>
            <Input
              value={settingsForm.vat_registration_no}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  vat_registration_no: e.target.value
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t('pricing.platform.economicCode')}</Label>
            <Input
              value={settingsForm.economic_code}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  economic_code: e.target.value
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={savingSettings}>
          <Save className="me-2 h-4 w-4" />
          {savingSettings
            ? t('pricing.platform.saving')
            : t('pricing.platform.saveSettings')}
        </Button>
      </div>

      <CostAssumptionsCard settings={settings} onSaved={loadAll} />

      <PlanPriceCalculatorCard settings={settings} plans={plans} />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{t('pricing.platform.plansTitle')}</CardTitle>
            <CardDescription>{t('pricing.platform.plansDesc')}</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={startNewPlan}
            disabled={editingPlanId !== null}
          >
            <Plus className="me-2 h-4 w-4" /> {t('pricing.platform.newPlan')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingPlanId !== null && (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold">
                {editingPlanId === 'new'
                  ? t('pricing.platform.newPlan')
                  : t('pricing.platform.editPlan')}
              </h3>
              <PlanFormFields
                form={planForm}
                isNew={editingPlanId === 'new'}
                onChange={setPlanForm}
                costs={settings ?? undefined}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={cancelPlan}>
                  <X className="me-1 h-3 w-3" /> {t('pricing.platform.cancel')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePlan}
                  disabled={savingPlan}
                >
                  <Check className="me-1 h-3 w-3" />
                  {savingPlan
                    ? t('pricing.platform.saving')
                    : t('pricing.platform.savePlan')}
                </Button>
              </div>
            </div>
          )}

          {plans.length === 0 && editingPlanId === null ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('pricing.platform.noPlans')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pricing.platform.colName')}</TableHead>
                  <TableHead>{t('pricing.platform.colMonthly')}</TableHead>
                  <TableHead>{t('pricing.platform.colAnnual')}</TableHead>
                  <TableHead>{t('pricing.platform.colStorage')}</TableHead>
                  <TableHead>{t('pricing.platform.colStatus')}</TableHead>
                  <TableHead className="text-end">
                    {t('pricing.platform.colActions')}
                  </TableHead>
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
                    <TableCell>{plan.storage_limit_gb} GB</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active
                          ? t('pricing.platform.statusActive')
                          : t('pricing.platform.statusInactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-1 text-end">
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

      <GatewayTogglesCard
        gateways={gateways}
        savingId={savingGatewayId}
        onToggle={handleToggleGateway}
        onRefresh={() => void loadGateways()}
      />

      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>{t('pricing.platform.summaryTitle')}</CardTitle>
            <CardDescription>
              {t('pricing.platform.summaryDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">
                  {t('pricing.platform.summaryVat')}
                </dt>
                <dd className="font-semibold">
                  {toPercent(asNumber(settings.vat_rate))}%
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('pricing.platform.summaryTeacherShare')}
                </dt>
                <dd className="font-semibold">
                  {toPercent(asNumber(settings.teacher_share_rate))}%
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('pricing.platform.summaryGrace')}
                </dt>
                <dd className="font-semibold">
                  {settings.subscription_grace_days}{' '}
                  {t('pricing.platform.days')}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('pricing.platform.summaryReminder')}
                </dt>
                <dd className="font-semibold">
                  {settings.subscription_reminder_days}{' '}
                  {t('pricing.platform.daysBefore')}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('pricing.platform.summaryOverage')}
                </dt>
                <dd className="font-semibold">
                  {formatIRR(asNumber(settings.storage_overage_fee_irr))}/GB
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('pricing.platform.summaryPhase')}
                </dt>
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
