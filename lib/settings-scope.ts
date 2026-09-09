export type SettingsScope = 'personal' | 'platform' | 'academy';

export const SETTINGS_SCOPE_I18N: Record<
  SettingsScope,
  { label: string; description: string }
> = {
  personal: {
    label: 'settings.scope.personal',
    description: 'settings.scope.personalDescription'
  },
  platform: {
    label: 'settings.scope.platform',
    description: 'settings.scope.platformDescription'
  },
  academy: {
    label: 'settings.scope.academy',
    description: 'settings.scope.academyDescription'
  }
};

const STARTER_PLAN_SLUGS = new Set(['basic', 'starter', 'none', '']);

export function isStarterPlan(planSlug: string | null | undefined): boolean {
  if (!planSlug) return true;
  return STARTER_PLAN_SLUGS.has(planSlug.toLowerCase());
}

// Mirrors Backend's normalizePlanSlug: business/enterprise/pro all resolve to
// the top tier. There is no self-serve plan above Business — anything bigger
// is a sales-negotiated custom deal, not a plan in this list — so "top plan"
// here means "no higher tier to upgrade to", not "the current max sort_order".
export function isTopPlan(planSlug: string | null | undefined): boolean {
  if (!planSlug) return false;
  const s = planSlug.toLowerCase();
  return (
    s.includes('business') ||
    s.includes('enterprise') ||
    s.includes('pro') ||
    s.includes('بیزینس') ||
    s.includes('سازمانی')
  );
}

export function shouldShowUpgradePrompt(
  status: string | undefined,
  daysRemaining: number | null | undefined,
  planSlug: string | null | undefined
): boolean {
  if (status === 'EXPIRED' || status === 'INACTIVE') return true;
  if (isStarterPlan(planSlug)) return true;
  if (daysRemaining != null && daysRemaining <= 14) return true;
  return false;
}

/**
 * A completed enrollment. Amount may be 0 (100% coupon). Trial invoices use
 * status TRIAL, so a PAID row always means they already picked a plan.
 */
export function hasPaidPlanEnrollment(params: {
  hasPaid?: boolean;
  invoices?: ReadonlyArray<{ status: string }>;
}): boolean {
  if (params.hasPaid === true) return true;
  return (params.invoices ?? []).some((invoice) => invoice.status === 'PAID');
}

type PaidEnrollmentFields = {
  has_paid?: boolean;
  is_trial?: boolean;
  can_renew_now?: boolean;
  days_remaining?: number | null;
  renewal_window_days?: number;
  period_months?: number | null;
  invoices?: ReadonlyArray<{ status: string; note?: string | null }>;
};

function periodMonthsFromInvoices(
  invoices: PaidEnrollmentFields['invoices']
): number | null {
  for (const invoice of invoices ?? []) {
    const months = invoice.note?.match(/months=(\d+)/)?.[1];
    if (months) return Number(months) === 3 ? 3 : 1;
  }
  return null;
}

/**
 * Older APIs treated a 100% coupon (PAID, amount 0) as unpaid. Overlay so the
 * panel marks the current plan even before that backend fix is deployed.
 */
export function overlayPaidEnrollment<T extends PaidEnrollmentFields>(
  subscription: T | null
): T | null {
  if (!subscription) return null;
  const hasPaid = hasPaidPlanEnrollment({
    hasPaid: subscription.has_paid,
    invoices: subscription.invoices
  });
  if (!hasPaid) return subscription;
  if (subscription.has_paid === true) {
    return subscription.is_trial
      ? { ...subscription, is_trial: false }
      : subscription;
  }
  const days = subscription.days_remaining ?? 0;
  const windowDays = subscription.renewal_window_days ?? 7;
  return {
    ...subscription,
    has_paid: true,
    is_trial: false,
    can_renew_now: days <= windowDays,
    period_months:
      subscription.period_months ??
      periodMonthsFromInvoices(subscription.invoices) ??
      1
  };
}

/** First purchase: the academy exists but has never had a paid platform plan. */
export function needsPlanPurchase(params: {
  hasAcademy: boolean;
  planSlug: string | null | undefined;
  status: string | undefined;
  hasPaid?: boolean;
}): boolean {
  // No academy yet means there is nothing to buy a plan for: that manager is
  // asked to create their first academy, not to pay.
  if (!params.hasAcademy) return false;
  const slug = params.planSlug?.trim().toLowerCase();
  if (!slug || slug === 'none') return true;
  if (params.status === 'INACTIVE' || params.status === 'EXPIRED') return true;
  if (!params.hasPaid) return true;
  return false;
}

export function shouldHideUpgradeCard(
  status: string | undefined,
  daysRemaining: number | null | undefined,
  planSlug: string | null | undefined
): boolean {
  if (status !== 'ACTIVE' && status !== 'GRACE') return false;
  if (isStarterPlan(planSlug)) return false;
  if (daysRemaining == null) return true;
  return daysRemaining > 30;
}
