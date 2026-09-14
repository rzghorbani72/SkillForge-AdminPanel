import type { StructuredPlanLimits } from '@/lib/api';
import { previewPlanMargin, type MarginCosts } from './plan-margin-preview';
import { COST_DEFAULTS, type CostSettingKey } from './pricing-helpers';

export const TOMAN_PRICE_STEP = 500_000;
const APP_EGRESS_SHARE = 0.03;

export function floorTomanPrice(toman: number): number {
  return Math.max(TOMAN_PRICE_STEP, Math.floor(toman / TOMAN_PRICE_STEP) * TOMAN_PRICE_STEP);
}

export function ceilTomanPrice(toman: number): number {
  return Math.max(TOMAN_PRICE_STEP, Math.ceil(toman / TOMAN_PRICE_STEP) * TOMAN_PRICE_STEP);
}

export function planQuarterlyToman(monthlyToman: number): number {
  return floorTomanPrice(monthlyToman * 3 * 0.95);
}

export interface CalculatorCosts extends MarginCosts {
  cost_platform_fixed_monthly_toman: number;
}

export interface PlanPriceRow {
  slug: string;
  name: string;
  limits: StructuredPlanLimits;
  liveMonthlyToman: number;
  variableCogs: number;
  recommendedMonthlyToman: number;
  recommendedQuarterlyToman: number;
  deltaToman: number;
  grossMarginPercent: number;
  cogsPercent: number;
  topCostDriver: 'storage' | 'egress' | 'compute' | 'sms' | 'gateway';
  breakEvenAcademies: number;
  ok: boolean;
}

const numberOr = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;

export function marginCostsFromForm(form: Record<CostSettingKey, string>): CalculatorCosts {
  return {
    cost_storage_per_gb_toman: numberOr(
      Number(form.cost_storage_per_gb_toman),
      COST_DEFAULTS.cost_storage_per_gb_toman,
    ),
    cost_egress_per_gb_toman: numberOr(
      Number(form.cost_egress_per_gb_toman),
      COST_DEFAULTS.cost_egress_per_gb_toman,
    ),
    cost_app_egress_per_gb_toman: numberOr(
      Number(form.cost_app_egress_per_gb_toman),
      COST_DEFAULTS.cost_app_egress_per_gb_toman,
    ),
    cost_compute_base_per_academy_toman: numberOr(
      Number(form.cost_compute_base_per_academy_toman),
      COST_DEFAULTS.cost_compute_base_per_academy_toman,
    ),
    cost_compute_per_student_toman: numberOr(
      Number(form.cost_compute_per_student_toman),
      COST_DEFAULTS.cost_compute_per_student_toman,
    ),
    cost_sms_per_message_toman: numberOr(
      Number(form.cost_sms_per_message_toman),
      COST_DEFAULTS.cost_sms_per_message_toman,
    ),
    cost_gateway_fee_rate: numberOr(
      Number(form.cost_gateway_fee_rate) / 100,
      COST_DEFAULTS.cost_gateway_fee_rate,
    ),
    cost_platform_fixed_monthly_toman: numberOr(
      Number(form.cost_platform_fixed_monthly_toman),
      COST_DEFAULTS.cost_platform_fixed_monthly_toman,
    ),
  };
}

function computeVariableCogs(
  limits: StructuredPlanLimits,
  costs: CalculatorCosts,
  smsPerStudent: number,
): number {
  const storage = limits.storage_gb * costs.cost_storage_per_gb_toman;
  const deliveredGb = limits.monthly_traffic_gb;
  const egress =
    deliveredGb * costs.cost_egress_per_gb_toman +
    deliveredGb * APP_EGRESS_SHARE * costs.cost_app_egress_per_gb_toman;
  const students = limits.tutoring_students;
  const compute =
    costs.cost_compute_base_per_academy_toman + students * costs.cost_compute_per_student_toman;
  const sms = students * smsPerStudent * costs.cost_sms_per_message_toman;
  return Math.round(storage + egress + compute + sms);
}

export function recommendMonthlyToman(
  limits: StructuredPlanLimits,
  costs: CalculatorCosts,
  targetGrossMarginPercent: number,
  smsPerStudent: number,
): number {
  const variableCogs = computeVariableCogs(limits, costs, smsPerStudent);
  const maxCogsShare = 1 - targetGrossMarginPercent / 100;
  const denominator = maxCogsShare - costs.cost_gateway_fee_rate;
  let price =
    !Number.isFinite(denominator) || denominator <= 0
      ? ceilTomanPrice(Math.max(variableCogs, TOMAN_PRICE_STEP))
      : ceilTomanPrice(Math.max(variableCogs / denominator, TOMAN_PRICE_STEP));

  for (let step = 0; step < 200; step++) {
    const margin = previewPlanMargin(price, limits, costs, smsPerStudent);
    if (margin.grossMarginPercent >= targetGrossMarginPercent) break;
    price += TOMAN_PRICE_STEP;
  }

  return price;
}

export function buildPlanPriceRows(
  plans: Array<{
    slug: string;
    name: string;
    limits: StructuredPlanLimits;
    liveMonthlyToman: number;
  }>,
  costs: CalculatorCosts,
  targetGrossMarginPercent: number,
  smsPerStudent: number,
): PlanPriceRow[] {
  return plans.map((plan) => {
    const variableCogs = computeVariableCogs(plan.limits, costs, smsPerStudent);
    const recommendedMonthlyToman = recommendMonthlyToman(
      plan.limits,
      costs,
      targetGrossMarginPercent,
      smsPerStudent,
    );
    const margin = previewPlanMargin(recommendedMonthlyToman, plan.limits, costs, smsPerStudent);
    const grossProfit =
      recommendedMonthlyToman -
      variableCogs -
      recommendedMonthlyToman * costs.cost_gateway_fee_rate;

    return {
      slug: plan.slug,
      name: plan.name,
      limits: plan.limits,
      liveMonthlyToman: plan.liveMonthlyToman,
      variableCogs,
      recommendedMonthlyToman,
      recommendedQuarterlyToman: planQuarterlyToman(recommendedMonthlyToman),
      deltaToman: recommendedMonthlyToman - plan.liveMonthlyToman,
      grossMarginPercent: margin.grossMarginPercent,
      cogsPercent: margin.cogsPercent,
      topCostDriver: margin.topCostDriver,
      breakEvenAcademies:
        grossProfit > 0 ? Math.ceil(costs.cost_platform_fixed_monthly_toman / grossProfit) : 0,
      ok: margin.ok,
    };
  });
}
