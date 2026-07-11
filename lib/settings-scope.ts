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
