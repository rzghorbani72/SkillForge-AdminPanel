'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Globe, Info } from 'lucide-react';
import Link from '@/components/ui/link';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { useSettingsData } from '../_hooks/use-settings-data';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { AcademyFeaturesCard } from '@/components/settings/academy-features-card';
import { TEACHER_SHARE_HREF } from '@/components/settings/academy-teacher-share-card';
import { AcademySiteStatusCard } from '@/components/settings/academy-site-status-card';
import { AcademyShowcaseCard } from '@/components/settings/academy-showcase-card';
import {
  AcademyEditForm,
  buildAcademyThemePatch,
  type AcademyEditPayload,
} from '@/components/academies/academy-edit-form';

export default function AcademySettingsPage() {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const { academy, isLoading, refresh } = useSettingsData();

  const handleSave = async (data: AcademyEditPayload) => {
    try {
      await apiClient.updateAcademy({
        name: data.name,
        private_domain: data.slug,
        public_address: data.publicAddress.trim() || null,
        description: data.description || undefined,
        logo_id: data.logoId,
        favicon_id: data.faviconId,
      });
      if (data.primaryColor) {
        await apiClient
          .updateCurrentThemeConfig(buildAcademyThemePatch(data.primaryColor))
          .catch(() => {});
      }
      refresh();
      ErrorHandler.showSuccess(t('settings.storeSettingsUpdatedSuccess'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!academy) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <SettingsSectionHeader
          title={t('settings.storeSettingsTitle')}
          subtitle={t('settings.storeSettingsPlatformDescription')}
          scope="platform"
        />
        <p className="text-sm text-muted-foreground">
          {t('settings.storeSettingsPlatformDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <SettingsSectionHeader
        title={t('settings.storeSettingsTitle')}
        subtitle={t('settings.storeSettingsPlatformDescription')}
        scope="platform"
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stores.editModalHeading')}</CardTitle>
              <CardDescription>{t('settings.generalInformationDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AcademyEditForm academy={academy} onSubmit={handleSave} t={t} />
            </CardContent>
          </Card>

          <AcademyFeaturesCard />
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.teacherShareTitle')}</CardTitle>
              <CardDescription>{t('settings.teacherShareMovedDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link href={TEACHER_SHARE_HREF}>{t('settings.teacherShareMovedCta')}</Link>
              </Button>
            </CardContent>
          </Card>
          <AcademySiteStatusCard academyName={academy.name ?? ''} />
          <AcademyShowcaseCard />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Building2 className="h-4 w-4" /> {t('settings.currentOverview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between gap-3">
                <span>{t('settings.creatingManager')}</span>
                <span className="text-end font-medium text-foreground">
                  {academy.manager_name ?? '—'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span>{t('settings.createdAt')}</span>
                <span className="text-end font-medium text-foreground">
                  {academy.created_at ? formatDate(academy.created_at) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('settings.students')}</span>
                <span className="font-medium text-foreground">{academy.students_count ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('settings.teachers')}</span>
                <span className="font-medium text-foreground">{academy.teachers_count ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('settings.managers')}</span>
                <span className="font-medium text-foreground">{academy.managers_count ?? '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Globe className="h-4 w-4" /> {t('settings.domainTips')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t('settings.domainTipsText1')}</p>
              <p>{t('settings.domainTipsText2')}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/domain">{t('settings.domainTipsCta')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Info className="h-4 w-4" /> {t('settings.needHelp')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t('settings.needHelpText')}</p>
              <Button variant="outline" size="sm">
                {t('settings.openDocumentation')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
