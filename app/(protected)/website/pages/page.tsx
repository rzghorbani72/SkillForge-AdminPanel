'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { AcademyPageEditor } from '@/components/settings/site-pages/academy-page-editor';
import { ContactLinksEditor } from '@/components/settings/site-pages/contact-links-editor';
import { useAcademySite } from '@/components/settings/site-pages/use-academy-site';
import { useTranslation } from '@/lib/i18n/hooks';

export default function SitePagesSettingsPage() {
  const { t } = useTranslation();
  const { pages, links, isLoading, refresh } = useAcademySite();

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <SettingsSectionHeader
        title={t('settings.sitePages.title')}
        subtitle={t('settings.sitePages.description')}
        scope="academy"
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[320px]" />
          <Skeleton className="h-[320px]" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            {pages.map((page) => (
              <AcademyPageEditor key={page.slug} page={page} onSaved={refresh} />
            ))}
          </div>

          <ContactLinksEditor links={links} onSaved={refresh} />
        </div>
      )}
    </div>
  );
}
