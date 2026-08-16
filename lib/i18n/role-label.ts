import type { InterpolationParams } from './index';

export type TranslateFn = (key: string, params?: InterpolationParams) => string;

/**
 * Custom roles are created at runtime, so a missing translation is expected:
 * `t()` echoes the key back, which is how we detect it and fall back to the
 * role's own name instead of printing `common.roles.SOMETHING`.
 */
export function getRoleLabel(
  roleName: string | null | undefined,
  t: TranslateFn
) {
  if (!roleName) return t('common.none');

  const key = `common.roles.${roleName.toUpperCase()}`;
  const label = t(key);
  return label === key ? roleName : label;
}

/**
 * Same rule for a loaded role record: a built-in role is translated by name, a
 * custom role shows the label its creator typed.
 */
export function getRoleDisplayLabel(
  role: { name: string; label?: string | null },
  t: TranslateFn
) {
  const translated = getRoleLabel(role.name, t);
  return translated === role.name ? role.label || role.name : translated;
}
