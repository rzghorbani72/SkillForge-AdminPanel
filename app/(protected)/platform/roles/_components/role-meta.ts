import type { InterpolationParams } from '@/lib/i18n';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { PlatformRole } from '@/types/roles';

type TranslateFn = (key: string, params?: InterpolationParams) => string;

export interface RoleMeta {
  label: string;
  /** One line on what the role is for; falls back to whatever the API stored. */
  hint: string;
}

export function getRoleMeta(role: PlatformRole, t: TranslateFn): RoleMeta {
  const hintKey = `roles.hint.${role.name.toUpperCase()}`;
  const hint = t(hintKey);
  // Built-in roles are translated by name; a custom role shows the label its
  // creator typed, and only falls back to the raw key when there is none.
  const translated = getRoleLabel(role.name, t);
  const label = translated === role.name ? role.label || role.name : translated;

  return {
    label,
    hint: hint === hintKey ? (role.description ?? role.label) : hint
  };
}
