'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Building2, Globe, Info } from 'lucide-react';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { useSettingsData } from '../_hooks/use-settings-data';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { extractDomainPart, formatDomain } from '@/lib/store-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { AcademyFeaturesCard } from '@/components/settings/academy-features-card';
import { AcademySiteStatusCard } from '@/components/settings/academy-site-status-card';
import { VisitSiteLink } from '@/components/shared/visit-site-link';

interface AcademyFormState {
  name: string;
  description: string;
  domain: string;
}

const DEFAULT_FORM: AcademyFormState = {
  name: '',
  description: '',
  domain: ''
};

export default function AcademySettingsPage() {
  const { t } = useTranslation();
  const { academy, isLoading, refresh } = useSettingsData();
  const [form, setForm] = useState<AcademyFormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!academy) {
      setForm(DEFAULT_FORM);
      return;
    }

    setForm({
      name: academy.name ?? '',
      description: academy.description ?? '',
      domain: academy.private_address ?? ''
    });
  }, [academy]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updateData: {
        name?: string;
        description?: string;
        private_domain?: string;
      } = {};

      if (form.name) updateData.name = form.name;
      if (form.description !== undefined)
        updateData.description = form.description;

      if (form.domain && form.domain.trim()) {
        const domainPart = extractDomainPart(form.domain);
        const formattedDomain = formatDomain(domainPart);
        if (formattedDomain) {
          updateData.private_domain = formattedDomain;
        }
      }

      await apiClient.updateAcademy(updateData);
      refresh();
      ErrorHandler.showSuccess(t('settings.storeSettingsUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating store settings', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <SettingsSectionHeader
        title={t('settings.storeSettingsTitle')}
        subtitle={t('settings.storeSettingsPlatformDescription')}
        scope="platform"
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.generalInformation')}</CardTitle>
              <CardDescription>
                {t('settings.generalInformationDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">{t('settings.storeName')}</Label>
                  <Input
                    id="storeName"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder={t('settings.storeNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">{t('settings.customDomain')}</Label>
                  <Input
                    id="domain"
                    value={form.domain}
                    onChange={(event) =>
                      setForm({ ...form, domain: event.target.value })
                    }
                    placeholder={t('settings.customDomainPlaceholder')}
                  />
                  <VisitSiteLink academy={academy} variant="ghost" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">
                    {t('settings.description')}
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder={t('settings.descriptionPlaceholder')}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? t('settings.saving') : t('settings.saveChanges')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AcademyFeaturesCard />

          <AcademySiteStatusCard academyName={academy?.name ?? ''} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Building2 className="h-4 w-4" />{' '}
                {t('settings.currentOverview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>{t('settings.students')}</span>
                <span className="font-medium text-foreground">
                  {academy?.students_count ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('settings.teachers')}</span>
                <span className="font-medium text-foreground">
                  {academy?.teachers_count ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('settings.managers')}</span>
                <span className="font-medium text-foreground">
                  {academy?.managers_count ?? '—'}
                </span>
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
