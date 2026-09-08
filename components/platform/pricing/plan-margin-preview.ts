import type { StructuredPlanLimits } from '@/lib/api';

/** Mirrors Backend plan-economics defaults (Hamravesh storage + planning egress). */
const STORAGE_PER_GB = 504;
const EGRESS_PER_GB = 400;
const COMPUTE_BASE = 50_000;
const COMPUTE_PER_STUDENT = 500;
const SMS_PER_MESSAGE = 300;
const GATEWAY_FEE_RATE = 0.01;
const STORAGE_UTIL = 0.7;
const ACTIVE_STUDENT_SHARE = 0.7;
const HOURS_PER_STUDENT = 3;
const GB_PER_HOUR = 1.18;
const SMS_PER_STUDENT = 1;
const MIN_GROSS_MARGIN_PERCENT = 70;

export interface PlanMarginPreview {
  ok: boolean;
  revenue: number;
  grossMarginPercent: number;
  cogsPercent: number;
  topCostDriver: 'storage' | 'egress' | 'compute' | 'sms' | 'gateway';
}

export function previewPlanMargin(
  revenueToman: number,
  limits: StructuredPlanLimits
): PlanMarginPreview {
  const storedGb = limits.storage_gb * STORAGE_UTIL;
  const activeStudents = limits.tutoring_students * ACTIVE_STUDENT_SHARE;
  const streamedGb = activeStudents * HOURS_PER_STUDENT * GB_PER_HOUR;

  const storageCost = storedGb * STORAGE_PER_GB;
  const egressCost = streamedGb * EGRESS_PER_GB;
  const computeCost = COMPUTE_BASE + activeStudents * COMPUTE_PER_STUDENT;
  const smsCost = activeStudents * SMS_PER_STUDENT * SMS_PER_MESSAGE;
  const gatewayCost = revenueToman * GATEWAY_FEE_RATE;
  const cogs = storageCost + egressCost + computeCost + smsCost + gatewayCost;
  const grossProfit = revenueToman - cogs;
  const grossMarginPercent =
    revenueToman > 0 ? (grossProfit / revenueToman) * 100 : 0;
  const cogsPercent = revenueToman > 0 ? (cogs / revenueToman) * 100 : 0;

  const drivers: [PlanMarginPreview['topCostDriver'], number][] = [
    ['storage', storageCost],
    ['egress', egressCost],
    ['compute', computeCost],
    ['sms', smsCost],
    ['gateway', gatewayCost]
  ];
  drivers.sort((a, b) => b[1] - a[1]);

  return {
    ok: grossMarginPercent >= MIN_GROSS_MARGIN_PERCENT,
    revenue: revenueToman,
    grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
    cogsPercent: Math.round(cogsPercent * 10) / 10,
    topCostDriver: drivers[0][0]
  };
}
