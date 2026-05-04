import type { InterpolationParams } from './index';

type TranslateFn = (key: string, params?: InterpolationParams) => string;

export function getRoleLabel(
  roleName: string | null | undefined,
  t: TranslateFn
) {
  if (!roleName) return t('common.none');

  const normalizedRole = roleName.toUpperCase();

  switch (normalizedRole) {
    case 'ADMIN':
      return t('common.roles.admin');
    case 'MANAGER':
      return t('common.roles.manager');
    case 'TEACHER':
      return t('common.roles.teacher');
    case 'STUDENT':
      return t('common.roles.student');
    case 'USER':
      return t('common.roles.user');
    default:
      return roleName;
  }
}
