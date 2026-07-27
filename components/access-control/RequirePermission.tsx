'use client';

import { ReactNode } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { hasPermission } from '@/lib/permissions';

interface Props {
  resource: string;
  action: string;
  children: ReactNode;
}

/**
 * Gates a page/section on the roles/permissions engine's (resource, action)
 * grid, fetched from the API onto the logged-in user (see useAuthUser's
 * granularPermissions). Distinct from role-name checks in lib/roles.ts.
 */
export function RequirePermission({ resource, action, children }: Props) {
  const { t } = useTranslation();
  const { user, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasPermission(user, resource, action)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('accessControl.deniedTitle')}</CardTitle>
            <CardDescription>
              {t('accessControl.deniedDescription')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
