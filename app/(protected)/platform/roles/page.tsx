'use client';

import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { RequirePermission } from '@/components/access-control/RequirePermission';
import { RolesManager } from './_components/roles-manager';

export default function PlatformRolesPage() {
  const { t } = useTranslation();

  return (
    <RequirePermission resource="roles" action="read">
      <div className="flex-1 space-y-6 p-6">
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
