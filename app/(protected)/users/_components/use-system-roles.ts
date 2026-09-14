'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { RoleConfig } from '@/components/users/user-role-badge';

/** Built-in roles with their colour tone and headline permissions. */
export function useSystemRoles(): RoleConfig[] {
  const { t } = useTranslation();
  return [
    {
      id: 'STUDENT',
      label: t('users.roleStudent'),
      tone: 240,
      system: true,
      permissions: [
        t('users.permViewCourses'),
        t('users.permAccessContent'),
        t('users.permSubmitQuestion'),
      ],
    },
    {
      id: 'TEACHER',
      label: t('users.roleTeacher'),
      tone: 165,
      system: true,
      permissions: [
        t('users.permAddEditCourse'),
        t('users.permAnswerQuestions'),
        t('users.permWithdrawEarnings'),
      ],
    },
    {
      id: 'MANAGER',
      label: t('users.roleManager'),
      tone: 22,
      system: true,
      permissions: [
        t('users.permManageUsers'),
        t('users.permFinancialReports'),
        t('users.permManagePlans'),
      ],
    },
  ];
}
