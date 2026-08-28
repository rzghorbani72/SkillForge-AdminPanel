import type { InterpolationParams } from '@/lib/i18n';
import type { PlatformRole } from '@/types/roles';
import { getAccessLevelLabel } from './access-levels';

type TranslateFn = (key: string, params?: InterpolationParams) => string;
type FormatNumberFn = (value: number) => string;

const MAX_LISTED_AREAS = 3;

/**
 * One line describing what a role can actually do, derived from its current
 * grants — so the card stays true after the permissions are edited. Used only
 * when the role has no built-in hint and no description typed by its creator.
 */
export function buildAutoHint(
  role: PlatformRole,
  t: TranslateFn,
  formatNumber: FormatNumberFn
): string {
  const level = getAccessLevelLabel(role.hierarchy_level, t);
  const resources = Array.from(
    new Set(role.permissions.map((permission) => permission.resource))
  );

  if (resources.length === 0) {
    return t('roles.autoHintEmpty', { level });
  }

  const listed = resources
    .slice(0, MAX_LISTED_AREAS)
    .map((resource) => t(`roles.resource.${resource}`))
    .join(t('roles.areaSeparator'));
  const remaining = resources.length - MAX_LISTED_AREAS;
  const areas =
    remaining > 0
      ? `${listed} ${t('roles.autoHintMore', { count: formatNumber(remaining) })}`
      : listed;

  return t('roles.autoHint', { level, areas });
}
