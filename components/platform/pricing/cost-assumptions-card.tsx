'use client';

import { apiErrorMessage } from '@/lib/api-error-message';
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { ErrorHandler } from '@/lib/error-handler';
import { apiClient, type PlatformSettingsData } from '@/lib/api';
import { COST_DEFAULTS, fromPercent, toPercent, type CostSettingKey } from './pricing-helpers';

/** Money fields render with thousands separators; small counts do not. */
const PRICE_FIELDS: CostSettingKey[] = [
  'cost_storage_per_gb_toman',
  'cost_egress_per_gb_toman',
  'cost_app_egress_per_gb_toman',
  'cost_compute_base_per_academy_toman',
  'cost_platform_fixed_monthly_toman',
  'storage_addon_price_toman',
  'traffic_addon_price_toman',
];

const UNIT_COST_FIELDS: CostSettingKey[] = [
  'cost_storage_per_gb_toman',
  'cost_egress_per_gb_toman',
  'cost_app_egress_per_gb_toman',
  'cost_compute_base_per_academy_toman',
  'cost_compute_per_student_toman',
  'cost_sms_per_message_toman',
  'cost_platform_fixed_monthly_toman',
];

const ADDON_FIELDS: CostSettingKey[] = [
  'storage_addon_gb',
  'storage_addon_price_toman',
  'traffic_addon_gb',
  'traffic_addon_price_toman',
];

type FormState = Record<CostSettingKey, string>;

const toForm = (settings: PlatformSettingsData | null): FormState => {
  const entries = (Object.keys(COST_DEFAULTS) as CostSettingKey[]).map((key) => {
    const raw = settings?.[key];
    const value =
      key === 'cost_gateway_fee_rate'
        ? toPercent(typeof raw === 'number' ? raw : COST_DEFAULTS[key])
        : typeof raw === 'number'
          ? raw
          : COST_DEFAULTS[key];
    return [key, String(value)] as const;
  });
  return Object.fromEntries(entries) as FormState;
};

interface Props {
  settings: PlatformSettingsData | null;
  onSaved: () => void | Promise<void>;
}

/**
 * The unit costs the plan margin check runs against, plus the capacity packs a
 * manager can buy mid-period.
 *
 * These live here rather than in code because they are provider list prices:
 * when Hamravesh moves a rate, the owner should be able to re-test every tier's
 * margin the same afternoon instead of waiting for a deploy. Each input's
 * placeholder is the measured figure the current pricing was designed against,
 * so a drifted value is visible at a glance.
 */
export function CostAssumptionsCard({ settings, onSaved }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [form, setForm] = useState<FormState>(() => toForm(settings));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setForm(toForm(settings));
  }, [settings]);

  const set = (key: CostSettingKey, raw: string) => setForm((prev) => ({ ...prev, [key]: raw }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = (Object.keys(COST_DEFAULTS) as CostSettingKey[]).reduce<
        Record<string, number>
      >((acc, key) => {
        const value = Number(form[key]);
        acc[key] = Number.isFinite(value)
          ? key === 'cost_gateway_fee_rate'
            ? fromPercent(value)
            : value
          : COST_DEFAULTS[key];
        return acc;
      }, {});

      await apiClient.updatePlatformSettings(payload as Partial<PlatformSettingsData>);
      ErrorHandler.showSuccess(t('pricing.costs.saveSuccess'));
      await onSaved();
    } catch (error) {
      ErrorHandler.showError(apiErrorMessage(error, t('pricing.costs.saveFailed')));
    } finally {
      setSaving(false);
    }
  };

  const field = (key: CostSettingKey) => {
    const placeholder = formatNumber(
      key === 'cost_gateway_fee_rate' ? toPercent(COST_DEFAULTS[key]) : COST_DEFAULTS[key],
    );

    return (
      <div key={key} className="space-y-1">
        <Label className="text-[11px]">{t(`pricing.costs.keys.${key}`)}</Label>
        {PRICE_FIELDS.includes(key) ? (
          <PriceInput
            value={form[key]}
            onChange={(raw) => set(key, raw)}
            placeholder={placeholder}
          />
        ) : (
          <NumberInput
            value={form[key]}
            onChange={(raw) => set(key, raw)}
            allowDecimal={key === 'cost_gateway_fee_rate'}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pricing.costs.title')}</CardTitle>
        <CardDescription>{t('pricing.costs.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs">{t('pricing.costs.unitCostsTitle')}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {UNIT_COST_FIELDS.map(field)}
            {field('cost_gateway_fee_rate')}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{t('pricing.costs.addonsTitle')}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{ADDON_FIELDS.map(field)}</div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="me-2 h-4 w-4" />
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
