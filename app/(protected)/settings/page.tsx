'use client';

import { Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHubGroups } from '@/components/settings/settings-hub-groups';
import { HUB_TONES, HubCardGrid, TintedPanel } from '@/components/settings/tinted-nav-card';
import { isPlatformAdmin } from '@/lib/roles';
import { useSettingsData } from './_hooks/use-settings-data';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useAuthUser } from '@/hooks/useAuthUser';
import { DefaultAcademyCard } from '@/components/settings/default-academy-card';
import { formatPhoneDisplay } from '@/lib/phone-utils';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

export default function SettingsOverviewPage() {
  const { t, language } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const { user: authUser } = useAuthUser();
  const { user, academy, isLoading, refresh } = useSettingsData();
  const isPlatformAdminUser = isPlatformAdmin(authUser);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <HubCardGrid>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </HubCardGrid>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.description')}</p>
        </div>
        <Button variant="outline" onClick={refresh}>
          {t('settings.refreshData')}
        </Button>
      </div>

      <HubCardGrid className="xl:grid-cols-2">
        <TintedPanel
          tone={HUB_TONES.sky}
          icon={User}
          title={t('settings.accountSummary')}
          description={t('settings.accountSummaryDescription')}
        >
          <div className="flex justify-between gap-3">
            <span>{t('settings.administrator')}</span>
            <span className="text-end font-medium text-foreground">
              {user?.display_name ?? '—'}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{t('settings.email')}</span>
            <span className="text-end font-medium text-foreground">{user?.email ?? '—'}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{t('settings.phone')}</span>
            <span className="text-end font-medium text-foreground" dir="ltr">
              {user?.phone_number ? formatPhoneDisplay(user.phone_number, language) : '—'}
            </span>
          </div>
          {user?.created_at ? (
            <div className="flex justify-between gap-3">
              <span>{t('settings.joined')}</span>
              <span className="text-end font-medium text-foreground">
                {formatDate(user.created_at)}
              </span>
            </div>
          ) : null}
        </TintedPanel>

        <TintedPanel
          tone={HUB_TONES.teal}
          icon={Building}
          title={t('settings.storeSnapshot')}
          description={t('settings.storeSnapshotDescription')}
        >
          <div className="flex justify-between gap-3">
            <span>{t('settings.name')}</span>
            <span className="text-end font-medium text-foreground">{academy?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{t('settings.domain')}</span>
            <span className="text-end font-medium text-foreground">
              {academy?.private_address ?? '—'}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{t('settings.students')}</span>
            <span className="text-end font-medium text-foreground">
              {academy?.students_count != null ? formatNumber(academy.students_count) : '—'}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{t('settings.created')}</span>
            <span className="text-end font-medium text-foreground">
              {academy?.created_at ? formatDate(academy.created_at) : '—'}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{t('settings.creatingManager')}</span>
            <span className="text-end font-medium text-foreground">
              {academy?.manager_name ?? '—'}
            </span>
          </div>
        </TintedPanel>
      </HubCardGrid>

      <DefaultAcademyCard />
      <SettingsHubGroups isPlatformAdmin={Boolean(isPlatformAdminUser)} />
    </div>
  );
}
