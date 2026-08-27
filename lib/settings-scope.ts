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

/** First purchase: no academy yet, or academy has never had a paid platform plan. */
export function needsPlanPurchase(params: {
  hasAcademy: boolean;
  planSlug: string | null | undefined;
  status: string | undefined;
  hasPaid?: boolean;
}): boolean {
  if (!params.hasAcademy) return true;
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
