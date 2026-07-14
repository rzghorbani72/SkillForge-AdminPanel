'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPlatformOwner } from '@/lib/roles';
import { RolesManager } from './_components/roles-manager';

export default function PlatformRolesPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!isPlatformOwner(user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('roles.accessDenied')}</CardTitle>
            <CardDescription>
              {t('roles.accessDeniedDescription')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('roles.title')}
        </h2>
        <p className="text-muted-foreground">{t('roles.description')}</p>
      </div>
      <RolesManager />
    </div>
  );
}
