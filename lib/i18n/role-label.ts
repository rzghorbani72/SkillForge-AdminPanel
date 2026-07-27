import type { InterpolationParams } from './index';

type TranslateFn = (key: string, params?: InterpolationParams) => string;

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
