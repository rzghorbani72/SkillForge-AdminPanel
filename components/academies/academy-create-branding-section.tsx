'use client';

import { ImageUploadField } from '@/components/academies/image-upload-field';
import { BrandColorPicker } from '@/components/academies/brand-color-picker';
import type { TranslateFn } from '@/lib/i18n/role-label';
import { FAVICON_MAX_KB, LOGO_MAX_KB } from '@/lib/upload-limits';
import type { AcademyCreateForm } from './use-academy-create-form';

type AcademyCreateBrandingSectionProps = {
  form: AcademyCreateForm;
  t: TranslateFn;
};

export function AcademyCreateBrandingSection({ form, t }: AcademyCreateBrandingSectionProps) {
  const { logo, favicon } = form;

  return (
    <div className="space-y-4 sm:col-span-5 sm:border-s sm:border-border/60 sm:ps-8">
      <p className="text-xs font-medium text-muted-foreground">
        {t('stores.sectionBranding')}
        <span className="ms-1.5">{t('stores.optionalTag')}</span>
      </p>

      <div className="grid items-stretch gap-4 sm:grid-cols-2">
        <ImageUploadField
          size="sm"
          label={t('stores.brandingLogo')}
          hint={t('stores.brandingLogoHint', { max: LOGO_MAX_KB })}
          replaceHint={t('stores.brandingReplaceHint')}
          previewUrl={logo.preview}
          uploading={logo.uploading}
          onFile={logo.upload}
        />
        <ImageUploadField
          size="sm"
          label={t('stores.brandingFavicon')}
          hint={t('stores.brandingFaviconHint', { max: FAVICON_MAX_KB })}
          replaceHint={t('stores.brandingReplaceHint')}
          previewUrl={favicon.preview}
          uploading={favicon.uploading}
          onFile={favicon.upload}
        />
      </div>

      <BrandColorPicker
        value={form.primaryColor}
        onChange={form.setPrimaryColor}
        label={t('stores.brandingColor')}
        customLabel={t('stores.brandingColorCustom')}
      />
    </div>
  );
}
