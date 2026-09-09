'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { PlatformSettingsData, SubscriptionPlanData } from '@/lib/api';
import {
  COST_DEFAULTS,
  DEFAULT_LIMITS,
  formatToman,
  irrToToman,
  type CostSettingKey
} from './pricing-helpers';
import {
  buildPlanPriceRows,
  marginCostsFromForm,
  type PlanPriceRow
} from './plan-price-recommend';

const CALC_COST_KEYS: CostSettingKey[] = [
  'cost_storage_per_gb_toman',
  'cost_egress_per_gb_toman',
  'cost_app_egress_per_gb_toman',
  'cost_compute_base_per_academy_toman',
  'cost_compute_per_student_toman',
  'cost_sms_per_message_toman',
  'cost_platform_fixed_monthly_toman'
];

type FormState = Record<CostSettingKey, string>;

const toForm = (settings: PlatformSettingsData | null): FormState => {
  const entries = (Object.keys(COST_DEFAULTS) as CostSettingKey[]).map(
    (key) => {
      const raw = settings?.[key];
      const value =
        key === 'cost_gateway_fee_rate'
          ? (typeof raw === 'number' ? raw : COST_DEFAULTS[key]) * 100
          : typeof raw === 'number'
            ? raw
            : COST_DEFAULTS[key];
      return [key, String(value)] as const;
    }
  );
  return Object.fromEntries(entries) as FormState;
};

interface Props {
  settings: PlatformSettingsData | null;
  plans: SubscriptionPlanData[];
}

export function PlanPriceCalculatorCard({ settings, plans }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [form, setForm] = useState<FormState>(() => toForm(settings));
  const [targetMargin, setTargetMargin] = useState('70');
  const [gatewayFee, setGatewayFee] = useState('1');
  const [smsPerStudent, setSmsPerStudent] = useState('1');

  useEffect(() => {
    if (settings) setForm(toForm(settings));
  }, [settings]);

  const rows = useMemo((): PlanPriceRow[] => {
    const margin = Number(targetMargin);
    const sms = Number(smsPerStudent);
    if (!Number.isFinite(margin) || margin <= 0) return [];

    const costs = {
      ...marginCostsFromForm(form),
      cost_gateway_fee_rate:
        Number.isFinite(Number(gatewayFee)) && Number(gatewayFee) >= 0
          ? Number(gatewayFee) / 100
          : COST_DEFAULTS.cost_gateway_fee_rate
    };

    const priced = plans
      .filter((p) => p.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((plan) => ({
        slug: plan.slug,
        name: plan.name,
        limits: { ...DEFAULT_LIMITS, ...(plan.limits ?? {}) },
        liveMonthlyToman: irrToToman(plan.price_monthly)
      }));

    return buildPlanPriceRows(
      priced,
      costs,
      margin,
      Number.isFinite(sms) && sms >= 0 ? sms : 1
    );
  }, [form, gatewayFee, plans, smsPerStudent, targetMargin]);

  const set = (key: CostSettingKey, raw: string) =>
    setForm((prev) => ({ ...prev, [key]: raw }));

  const costField = (key: CostSettingKey) => (
    <div key={key} className="space-y-1">
      <Label className="text-[11px]">{t(`pricing.costs.keys.${key}`)}</Label>
      <PriceInput
        value={form[key]}
        onChange={(raw) => set(key, raw)}
        placeholder={formatNumber(COST_DEFAULTS[key])}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pricing.calculator.title')}</CardTitle>
        <CardDescription>{t('pricing.calculator.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {CALC_COST_KEYS.map(costField)}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>{t('pricing.calculator.targetMargin')}</Label>
            <NumberInput
              value={targetMargin}
              onChange={setTargetMargin}
              allowDecimal
              placeholder="70"
            />
            <p className="text-[11px] text-muted-foreground">
              {t('pricing.calculator.targetMarginHint')}
            </p>
          </div>
          <div className="space-y-1">
            <Label>{t('pricing.calculator.gatewayFee')}</Label>
            <NumberInput
              value={gatewayFee}
              onChange={setGatewayFee}
              allowDecimal
              placeholder="1"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('pricing.calculator.smsPerStudent')}</Label>
            <NumberInput
              value={smsPerStudent}
              onChange={setSmsPerStudent}
              placeholder="1"
            />
            <p className="text-[11px] text-muted-foreground">
              {t('pricing.calculator.smsPerStudentHint')}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t('pricing.calculator.formula')}
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('pricing.calculator.noPlans')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pricing.calculator.colPlan')}</TableHead>
                <TableHead>{t('pricing.calculator.colCogs')}</TableHead>
                <TableHead>{t('pricing.calculator.colRecommended')}</TableHead>
                <TableHead>{t('pricing.calculator.colQuarterly')}</TableHead>
                <TableHead>{t('pricing.calculator.colLive')}</TableHead>
                <TableHead>{t('pricing.calculator.colDelta')}</TableHead>
                <TableHead>{t('pricing.calculator.colMargin')}</TableHead>
                <TableHead>{t('pricing.calculator.colBreakEven')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.slug}>
                  <TableCell>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.slug}
                    </div>
                  </TableCell>
                  <TableCell>{formatToman(row.variableCogs)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatToman(row.recommendedMonthlyToman)}
                  </TableCell>
                  <TableCell>
                    {formatToman(row.recommendedQuarterlyToman)}
                  </TableCell>
                  <TableCell>{formatToman(row.liveMonthlyToman)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        row.deltaToman > 0
                          ? 'text-amber-600'
                          : row.deltaToman < 0
                            ? 'text-emerald-600'
                            : ''
                      }
                    >
                      {row.deltaToman > 0 ? '+' : ''}
                      {formatToman(row.deltaToman)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={row.ok ? 'default' : 'destructive'}>
                        {row.grossMarginPercent}%
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {t(
                          `pricing.planLimits.costDriver.${row.topCostDriver}`
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatNumber(row.breakEvenAcademies)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
