'use client';

import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SlugField } from '@/components/academies/slug-field';
import { ImageUploadField } from '@/components/academies/image-upload-field';
import { BrandColorPicker } from '@/components/academies/brand-color-picker';
import { VisitSiteLink } from '@/components/shared/visit-site-link';
import { useAcademyEditState } from '@/components/academies/use-academy-edit-state';
import type { AcademyEditPayload } from '@/components/academies/academy-edit-types';
import type { Academy } from '@/types/api';

export type { AcademyEditPayload } from '@/components/academies/academy-edit-types';
export { buildAcademyThemePatch } from '@/components/academies/academy-edit-types';

const STEPS = ['stepSpecs', 'stepBranding'] as const;

type AcademyEditFormProps = {
  academy: Academy;
  onSubmit: (data: AcademyEditPayload) => Promise<void>;
  onCancel?: () => void;
  t: (k: string) => string;
  /** Compact layout for dialogs; page layout uses full-width fields. */
  compact?: boolean;
};

export function AcademyEditForm({
  academy,
  onSubmit,
  onCancel,
  t,
  compact = false,
}: AcademyEditFormProps) {
  const state = useAcademyEditState(academy);
  const stepKeys = STEPS.map((k) => t(`stores.${k}`));

  async function handleSave() {
    const payload = state.buildPayload();
    if (!payload) return;
    state.setSaving(true);
    try {
      await onSubmit(payload);
    } finally {
      state.setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
        {stepKeys.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => state.setStep(i)}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              i === state.step
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground hover:bg-background/50',
            )}
          >
            <span className="bg-current/20 me-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold">
              {i + 1}
            </span>{' '}
            {label}
          </button>
        ))}
      </div>

      {state.step === 0 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="academy-name">{t('stores.academyName')}</Label>
            <Input
              id="academy-name"
              value={state.name}
              onChange={(e) => state.setName(e.target.value)}
              placeholder={t('stores.academyNamePlaceholder')}
              autoFocus={compact}
            />
          </div>

          <div className={cn('grid gap-3', compact ? 'grid-cols-2' : 'md:grid-cols-2')}>
            <SlugField
              value={state.slug}
              status={state.slugStatus}
              onChange={state.handleSlugChange}
              t={t}
            />
            <div className="space-y-2">
              <Label htmlFor="public-domain">{t('stores.publicDomainOptional')}</Label>
              <Input
                id="public-domain"
                value={state.publicAddress}
                onChange={(e) => state.setPublicAddress(e.target.value)}
                placeholder={t('stores.publicDomainPlaceholder')}
                dir="ltr"
              />
              {!compact ? <VisitSiteLink academy={academy} variant="ghost" /> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academy-description">{t('stores.shortDescription')}</Label>
            <Textarea
              id="academy-description"
              value={state.description}
              onChange={(e) => state.setDescription(e.target.value)}
              placeholder={t('stores.shortDescriptionPlaceholder')}
              rows={compact ? 3 : 4}
              className="resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid items-stretch gap-4 sm:grid-cols-2">
            <ImageUploadField
              label={t('stores.brandingLogo')}
              hint={t('stores.brandingLogoHint')}
              replaceHint={t('stores.brandingReplaceHint')}
              previewUrl={state.logo.preview}
              uploading={state.logo.uploading}
              onFile={state.logo.upload}
            />
            <ImageUploadField
              label={t('stores.brandingFavicon')}
              hint={t('stores.brandingFaviconHint')}
              replaceHint={t('stores.brandingReplaceHint')}
              previewUrl={state.favicon.preview}
              uploading={state.favicon.uploading}
              onFile={state.favicon.upload}
            />
          </div>
          <BrandColorPicker
            value={state.primaryColor}
            onChange={state.setPrimaryColor}
            label={t('stores.brandingColor')}
            customLabel={t('stores.brandingColorCustom')}
          />
        </div>
      )}

      <div className={cn('flex items-center pt-2', onCancel ? 'justify-between' : 'justify-end')}>
        {onCancel ? (
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={onCancel}
          >
            {t('stores.cancel')}
          </button>
        ) : null}
        <Button onClick={handleSave} disabled={!state.canSave}>
          {state.saving ? (
            <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="me-1.5 h-3.5 w-3.5" />
          )}
          {t('stores.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
