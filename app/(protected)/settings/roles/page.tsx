'use client';

import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { RequirePermission } from '@/components/access-control/RequirePermission';
import { RolesManager } from '@/components/roles/roles-manager';

/**
 * Academy-scoped roles. Same manager UI as the platform route, but reached from
 * a path that matches what it edits: the backend already filters roles to the
 * caller's academy, so the URL should not claim platform scope.
 */
export default function AcademyRolesPage() {
  const { t } = useTranslation();

  return (
    <RequirePermission resource="roles" action="read">
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <PageHeader
          icon={<ShieldCheck className="h-5 w-5" />}
          title={t('roles.title')}
          description={t('roles.description')}
        />
        <RolesManager />
      </div>
    </RequirePermission>
  );
}
