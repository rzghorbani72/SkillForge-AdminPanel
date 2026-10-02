'use client';

import { useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/components/providers/user-provider';
import { useSettingsData } from '../_hooks/use-settings-data';
import { PasswordCard } from './_components/password-card';
import { ProfileInfoCard } from './_components/profile-info-card';
import { ProfileKycSection } from '@/components/settings/kyc/profile-kyc-section';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';

export default function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { user, isLoading, refreshUser } = useSettingsData();
  const { user: authUser, refetch: refetchAuthUser } = useAuthUser();
  const academy = useCurrentAcademy();
  const showKyc = authUser?.role === 'MANAGER' && Boolean(academy?.id);

  // The header avatar and name come from the auth provider, not this page's
  // fetch, so a save has to refresh both or the header stays stale.
  const refreshAll = useCallback(() => {
    refreshUser();
    void refetchAuthUser();
  }, [refreshUser, refetchAuthUser]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('settings.profileSettingsTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('settings.profileSettingsSubtitle')}</p>
      </div>

      <ProfileInfoCard user={user} refreshUser={refreshUser} refreshAll={refreshAll} />

      <ProfileKycSection enabled={showKyc} />

      <PasswordCard />
    </div>
  );
}
