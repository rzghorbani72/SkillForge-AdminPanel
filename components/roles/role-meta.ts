import type { InterpolationParams } from '@/lib/i18n';
import { getRoleDisplayLabel } from '@/lib/i18n/role-label';
import type { PlatformRole } from '@/types/roles';
import { buildAutoHint } from './role-hint';

type TranslateFn = (key: string, params?: InterpolationParams) => string;
type FormatNumberFn = (value: number) => string;

export interface RoleMeta {
  label: string;
  /** One line on what the role is for; never a copy of the label. */
  hint: string;
}

export function getRoleMeta(
  role: PlatformRole,
  t: TranslateFn,
  formatNumber: FormatNumberFn = String
): RoleMeta {
  const hintKey = `roles.hint.${role.name.toUpperCase()}`;
  const builtInHint = t(hintKey);
  const label = getRoleDisplayLabel(role, t);
  const description = role.description?.trim();

  return {
    label,
    hint:
      builtInHint !== hintKey
        ? builtInHint
        : (description ?? '') || buildAutoHint(role, t, formatNumber)
  };
}
