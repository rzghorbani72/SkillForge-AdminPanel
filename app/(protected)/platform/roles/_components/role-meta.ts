import type { InterpolationParams } from '@/lib/i18n';
import { getRoleLabel } from '@/lib/i18n/role-label';
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
  // Built-in roles are translated by name; a custom role shows the label its
  // creator typed, and only falls back to the raw key when there is none.
  const translated = getRoleLabel(role.name, t);
  const label = translated === role.name ? role.label || role.name : translated;
  const description = role.description?.trim();

  return {
    label,
    hint:
      builtInHint !== hintKey
        ? builtInHint
        : (description ?? '') || buildAutoHint(role, t, formatNumber)
  };
}
