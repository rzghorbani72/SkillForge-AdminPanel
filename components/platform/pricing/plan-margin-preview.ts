import type { StructuredPlanLimits } from '@/lib/api';
import { COST_DEFAULTS } from './pricing-helpers';

/**
 * Client-side mirror of Backend `plan-economics.ts`, so the owner sees a margin
 * verdict while typing instead of only after a rejected save. The backend check
 * is still the authority — keep the two formulas identical.
 *
 * Every cap is priced at 100% fill: a plan promises the academy may use what it
 * bought, so the margin has to hold when it does.
 */
const STORAGE_UTIL = 1;
const TRAFFIC_UTIL = 1;
const ACTIVE_STUDENT_SHARE = 1;
const APP_EGRESS_SHARE_OF_TRAFFIC = 0.03;
const SMS_PER_STUDENT = 1;
const MIN_GROSS_MARGIN_PERCENT = 70;

/** Live unit costs from platform settings; falls back to the measured defaults. */
export interface MarginCosts {
  cost_storage_per_gb_toman: number;
  cost_egress_per_gb_toman: number;
  cost_app_egress_per_gb_toman: number;
  cost_compute_base_per_academy_toman: number;
  cost_compute_per_student_toman: number;
  cost_sms_per_message_toman: number;
  cost_gateway_fee_rate: number;
}

export interface PlanMarginPreview {
  ok: boolean;
  revenue: number;
  grossMarginPercent: number;
  cogsPercent: number;
  topCostDriver: 'storage' | 'egress' | 'compute' | 'sms' | 'gateway';
}

const numberOr = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;

export function previewPlanMargin(
  revenueToman: number,
  limits: StructuredPlanLimits,
  costs?: Partial<MarginCosts>,
  smsPerActiveStudent: number = SMS_PER_STUDENT,
): PlanMarginPreview {
  const storagePerGb = numberOr(
    costs?.cost_storage_per_gb_toman,
    COST_DEFAULTS.cost_storage_per_gb_toman,
  );
  const egressPerGb = numberOr(
    costs?.cost_egress_per_gb_toman,
    COST_DEFAULTS.cost_egress_per_gb_toman,
  );
  const appEgressPerGb = numberOr(
    costs?.cost_app_egress_per_gb_toman,
    COST_DEFAULTS.cost_app_egress_per_gb_toman,
  );
  const computeBase = numberOr(
    costs?.cost_compute_base_per_academy_toman,
    COST_DEFAULTS.cost_compute_base_per_academy_toman,
  );
  const computePerStudent = numberOr(
    costs?.cost_compute_per_student_toman,
    COST_DEFAULTS.cost_compute_per_student_toman,
  );
  const smsPerMessage = numberOr(
    costs?.cost_sms_per_message_toman,
    COST_DEFAULTS.cost_sms_per_message_toman,
  );
  const gatewayFeeRate = numberOr(
    costs?.cost_gateway_fee_rate,
    COST_DEFAULTS.cost_gateway_fee_rate,
  );

  const storedGb = limits.storage_gb * STORAGE_UTIL;
  const activeStudents = limits.tutoring_students * ACTIVE_STUDENT_SHARE;
  // Traffic is costed from the cap, which is what the academy is entitled to
  // deliver and therefore the most we can be billed for.
  const deliveredGb = limits.monthly_traffic_gb * TRAFFIC_UTIL;

  const storageCost = storedGb * storagePerGb;
  const egressCost =
    deliveredGb * egressPerGb + deliveredGb * APP_EGRESS_SHARE_OF_TRAFFIC * appEgressPerGb;
  const computeCost = computeBase + activeStudents * computePerStudent;
  const smsCost = activeStudents * smsPerActiveStudent * smsPerMessage;
  const gatewayCost = revenueToman * gatewayFeeRate;
  const cogs = storageCost + egressCost + computeCost + smsCost + gatewayCost;
  const grossProfit = revenueToman - cogs;
  const grossMarginPercent = revenueToman > 0 ? (grossProfit / revenueToman) * 100 : 0;
  const cogsPercent = revenueToman > 0 ? (cogs / revenueToman) * 100 : 0;

  const drivers: [PlanMarginPreview['topCostDriver'], number][] = [
    ['storage', storageCost],
    ['egress', egressCost],
    ['compute', computeCost],
    ['sms', smsCost],
    ['gateway', gatewayCost],
  ];
  drivers.sort((a, b) => b[1] - a[1]);

  return {
    ok: grossMarginPercent >= MIN_GROSS_MARGIN_PERCENT,
    revenue: revenueToman,
    grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
    cogsPercent: Math.round(cogsPercent * 10) / 10,
    topCostDriver: drivers[0][0],
  };
}
