'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { RequirePermission } from '@/components/access-control/RequirePermission';
import { RolesManager } from './_components/roles-manager';

export default function PlatformRolesPage() {
  const { t } = useTranslation();

  return (
    <RequirePermission resource="roles" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('roles.title')}
          </h2>
          <p className="text-muted-foreground">{t('roles.description')}</p>
        </div>
        <RolesManager />
      </div>
    </RequirePermission>
  );
}
