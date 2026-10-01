'use client';

import { apiErrorMessage } from '@/lib/api-error-message';
import { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin } from '@/lib/roles';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  apiClient,
  type GatewayConfigData,
  type PlatformSettingsData,
  type SubscriptionPlanData,
} from '@/lib/api';
import { type PlanFormState } from '@/components/platform/pricing/plan-form-fields';
import { GatewayTogglesCard } from '@/components/platform/pricing/gateway-toggles-card';
import { CostAssumptionsCard } from '@/components/platform/pricing/cost-assumptions-card';
import { PlanPriceCalculatorCard } from '@/components/platform/pricing/plan-price-calculator-card';
import {
  DEFAULT_LIMITS,
  fromPercent,
  irrToToman,
  tomanToIrr,
  toPercent,
} from '@/components/platform/pricing/pricing-helpers';
import { PlatformSummaryCard } from './_components/platform-summary-card';
import { PlatformPlansCard } from './_components/platform-plans-card';
import { PlatformTaxCard } from './_components/platform-tax-card';
import { PlatformFinancialRatesCard } from './_components/platform-financial-rates-card';
import { asNumber } from './_lib/page-helpers';

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
  limits: { ...DEFAULT_LIMITS },
});

const planToForm = (p: SubscriptionPlanData): PlanFormState => ({
  name: p.name,
  slug: p.slug,
  price_monthly_toman: String(irrToToman(p.price_monthly)),
  price_yearly_toman: p.price_yearly != null ? String(irrToToman(p.price_yearly)) : '',
  storage_limit_gb: String(p.storage_limit_gb),
  features: Array.isArray(p.features) ? p.features.join('\n') : '',
  is_active: p.is_active,
  is_most_popular: p.is_most_popular ?? false,
  annual_months_included: String(p.annual_months_included ?? 0),
  sort_order: String(p.sort_order),
  limits: { ...DEFAULT_LIMITS, ...(p.limits ?? {}) },
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
    economic_code: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | 'new' | null>(null);
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
      subscription_reminder_days: String(asNumber(s.subscription_reminder_days)),
      payment_release_phase: s.payment_release_phase ?? '',
      legal_entity_name: s.legal_entity_name ?? '',
      vat_registration_no: s.vat_registration_no ?? '',
      economic_code: s.economic_code ?? '',
    });
  }, []);

  const loadGateways = useCallback(async () => {
    try {
      const data = await apiClient.listGatewayConfigs();
      setGateways(data.gateways);
    } catch (error) {
      ErrorHandler.showError(apiErrorMessage(error, t('pricing.platform.gatewaysLoadFailed')));
    }
  }, [t]);

  const loadAll = useCallback(async () => {
    if (!isPlatformAdminUser) return;

    const [settingsResult, plansResult, gatewaysResult] = await Promise.allSettled([
      apiClient.getPlatformSettings(),
      apiClient.getSubscriptionPlans(),
      apiClient.listGatewayConfigs(),
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
        subscription_reminder_days: Number(settingsForm.subscription_reminder_days),
        payment_release_phase: settingsForm.payment_release_phase,
        legal_entity_name: settingsForm.legal_entity_name || null,
        vat_registration_no: settingsForm.vat_registration_no || null,
        economic_code: settingsForm.economic_code || null,
      } as Partial<PlatformSettingsData>);
      ErrorHandler.showSuccess(t('pricing.platform.saveSettingsSuccess'));
      await loadAll();
    } catch (error) {
      ErrorHandler.showError(apiErrorMessage(error, t('pricing.platform.saveSettingsFailed')));
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
      limits: planForm.limits,
    };
  };

  const handleSavePlan = async () => {
    setSavingPlan(true);
    try {
      if (editingPlanId === 'new') {
        await apiClient.createSubscriptionPlan(
          buildPlanPayload() as Parameters<typeof apiClient.createSubscriptionPlan>[0],
        );
        ErrorHandler.showSuccess(t('pricing.platform.planCreated'));
      } else if (editingPlanId) {
        await apiClient.updateSubscriptionPlan(editingPlanId, buildPlanPayload());
        ErrorHandler.showSuccess(t('pricing.platform.planUpdated'));
      }
      cancelPlan();
      await loadAll();
    } catch (error) {
      ErrorHandler.showError(apiErrorMessage(error, t('pricing.platform.savePlanFailed')));
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
    } catch (error) {
      ErrorHandler.showError(apiErrorMessage(error, t('pricing.platform.deletePlanFailed')));
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleToggleGateway = async (gateway: GatewayConfigData, isActive: boolean) => {
    setSavingGatewayId(gateway.id);
    setGateways((prev) =>
      prev.map((g) => (g.id === gateway.id ? { ...g, is_active: isActive } : g)),
    );
    try {
      await apiClient.updateGatewayConfig(gateway.id, { is_active: isActive });
      ErrorHandler.showSuccess(t('pricing.platform.gatewaySaved'));
    } catch (error) {
      setGateways((prev) =>
        prev.map((g) => (g.id === gateway.id ? { ...g, is_active: gateway.is_active } : g)),
      );
      ErrorHandler.showError(apiErrorMessage(error, t('pricing.platform.gatewaySaveFailed')));
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
            <CardDescription>{t('pricing.platform.accessRestrictedDesc')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t('pricing.platform.title')}</h1>
        <p className="text-muted-foreground">{t('pricing.platform.subtitle')}</p>
      </div>

      <PlatformFinancialRatesCard setSettingsForm={setSettingsForm} settingsForm={settingsForm} />

      <PlatformTaxCard setSettingsForm={setSettingsForm} settingsForm={settingsForm} />

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={savingSettings}>
          <Save className="me-2 h-4 w-4" />
          {savingSettings ? t('pricing.platform.saving') : t('pricing.platform.saveSettings')}
        </Button>
      </div>

      <CostAssumptionsCard settings={settings} onSaved={loadAll} />

      <PlanPriceCalculatorCard settings={settings} plans={plans} />

      <PlatformPlansCard
        cancelPlan={cancelPlan}
        deletingPlanId={deletingPlanId}
        editingPlanId={editingPlanId}
        handleDeletePlan={handleDeletePlan}
        handleSavePlan={handleSavePlan}
        planForm={planForm}
        plans={plans}
        savingPlan={savingPlan}
        setPlanForm={setPlanForm}
        settings={settings}
        startEditPlan={startEditPlan}
        startNewPlan={startNewPlan}
      />

      <GatewayTogglesCard
        gateways={gateways}
        savingId={savingGatewayId}
        onToggle={handleToggleGateway}
        onRefresh={() => void loadGateways()}
      />

      {settings && <PlatformSummaryCard settings={settings} />}
    </div>
  );
}
