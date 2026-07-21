'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PriceInput } from '@/components/ui/price-input';
import { useTranslation } from '@/lib/i18n/hooks';
import type { StructuredPlanLimits } from '@/lib/api';
import { PLAN_LIMIT_KEYS } from './pricing-helpers';

export type PlanFormState = {
  name: string;
  slug: string;
  price_monthly_toman: string;
  price_yearly_toman: string;
  storage_limit_gb: string;
  features: string;
  is_active: boolean;
  is_most_popular: boolean;
  annual_months_included: string;
  sort_order: string;
  limits: StructuredPlanLimits;
};

interface Props {
  form: PlanFormState;
  isNew: boolean;
  onChange: (next: PlanFormState) => void;
}

export function PlanFormFields({ form, isNew, onChange }: Props) {
  const { t } = useTranslation();

  const set = (patch: Partial<PlanFormState>) =>
    onChange({ ...form, ...patch });

  const setLimit = (key: keyof StructuredPlanLimits, value: string) =>
    set({
      limits: {
        ...form.limits,
        [key]: Number(value) || 0
      }
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">{t('pricing.planLimits.name')} *</Label>
          <Input
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              const slug = isNew
                ? name
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                : form.slug;
              set({ name, slug });
            }}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t('pricing.planLimits.slug')} *</Label>
          <Input
            value={form.slug}
            onChange={(e) => set({ slug: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">
            {t('pricing.planLimits.monthlyToman')}
          </Label>
          <PriceInput
            value={form.price_monthly_toman}
            onChange={(raw) => set({ price_monthly_toman: raw })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">
            {t('pricing.planLimits.yearlyToman')}
          </Label>
          <PriceInput
            value={form.price_yearly_toman}
            onChange={(raw) => set({ price_yearly_toman: raw })}
            placeholder={t('pricing.planLimits.optional')}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">
            {t('pricing.planLimits.storageLimitGb')}
          </Label>
          <Input
            type="number"
            min={0}
            value={form.storage_limit_gb}
            onChange={(e) => set({ storage_limit_gb: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">
            {t('pricing.planLimits.annualMonthsIncluded')}
          </Label>
          <Input
            type="number"
            min={0}
            value={form.annual_months_included}
            onChange={(e) => set({ annual_months_included: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t('pricing.planLimits.sortOrder')}</Label>
          <Input
            type="number"
            value={form.sort_order}
            onChange={(e) => set({ sort_order: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs">
          <Switch
            checked={form.is_active}
            onCheckedChange={(v) => set({ is_active: v })}
          />
          {t('pricing.planLimits.active')}
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Switch
            checked={form.is_most_popular}
            onCheckedChange={(v) => set({ is_most_popular: v })}
          />
          {t('pricing.planLimits.mostPopular')}
        </label>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">{t('pricing.planLimits.limitsTitle')}</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PLAN_LIMIT_KEYS.map((key) => (
            <div key={key} className="space-y-1">
              <Label className="text-[11px]">
                {t(`pricing.planLimits.keys.${key}`)}
              </Label>
              <Input
                type="number"
                min={0}
                value={String(form.limits[key])}
                onChange={(e) => setLimit(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('pricing.planLimits.features')}</Label>
        <textarea
          className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={form.features}
          onChange={(e) => set({ features: e.target.value })}
        />
      </div>
    </div>
  );
}
