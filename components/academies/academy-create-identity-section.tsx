'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SlugField } from '@/components/academies/slug-field';
import type { TranslateFn } from '@/lib/i18n/role-label';
import { AcademyCategorySelect } from './academy-category-select';
import type { AcademyCreateForm } from './use-academy-create-form';

type AcademyCreateIdentitySectionProps = {
  form: AcademyCreateForm;
  t: TranslateFn;
};

export function AcademyCreateIdentitySection({ form, t }: AcademyCreateIdentitySectionProps) {
  return (
    <div className="space-y-4 sm:col-span-7">
      <p className="text-xs font-medium text-muted-foreground">{t('stores.sectionIdentity')}</p>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium">{t('stores.academyName')}</label>
        <Input
          value={form.name}
          onChange={(e) => form.changeName(e.target.value)}
          placeholder={t('stores.academyNamePlaceholder')}
          dir="auto"
          autoFocus
        />
      </div>

      <SlugField value={form.slug} status={form.slugStatus} onChange={form.changeSlug} t={t} />

      <AcademyCategorySelect value={form.category} onChange={form.setCategory} t={t} />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          {t('stores.shortDescription')}
          <span className="ms-1.5 font-normal text-muted-foreground">
            {t('stores.optionalTag')}
          </span>
        </label>
        <Textarea
          value={form.description}
          onChange={(e) => form.setDescription(e.target.value)}
          placeholder={t('stores.shortDescriptionPlaceholder')}
          rows={2}
          className="resize-none"
        />
      </div>
    </div>
  );
}
