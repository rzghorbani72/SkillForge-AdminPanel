'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { SeoForm } from '@/components/website/seo-form';
import { SeoPreview } from '@/components/website/seo-preview';
import { useSeoFormState } from '@/components/website/use-seo-form-state';
import { buildAcademySiteUrl } from '@/lib/website/academy-site-url';
import { useTranslation } from '@/lib/i18n/hooks';

export default function WebsiteSeoPage() {
  const { t } = useTranslation();
  const state = useSeoFormState();
  const { academy, metaTitle, metaDescription, shareImage, loading } = state;

  // The preview must show what a visitor gets, so it applies the same fallback
  // chain the public site does when a field is left empty.
  const previewTitle = metaTitle.trim() || academy?.name || '';
  const previewDescription =
    metaDescription.trim() || academy?.description || t('website.seo.previewEmptyDescription');
  const siteUrl = buildAcademySiteUrl(academy) ?? '';

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <SettingsSectionHeader
        title={t('website.seo.title')}
        subtitle={t('website.seo.description')}
        scope="academy"
      />

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[420px]" />
          <Skeleton className="h-[420px]" />
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <SeoForm state={state} />
          <SeoPreview
            title={previewTitle}
            description={previewDescription}
            siteUrl={siteUrl}
            shareImageUrl={shareImage.preview}
          />
        </div>
      )}
    </div>
  );
}
