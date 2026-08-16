'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { SlugField } from '@/components/academies/slug-field';
import { ImageUploadField } from '@/components/academies/image-upload-field';
import {
  BrandColorPicker,
  DEFAULT_BRAND_COLOR
} from '@/components/academies/brand-color-picker';
import { useImageUpload } from '@/hooks/use-image-upload';
import { toSlug } from '@/lib/slug';
import {
  isSlugBlocking,
  useSlugAvailability
} from '@/hooks/use-slug-availability';
import type { Academy } from '@/types/api';

const STEPS = ['stepSpecs', 'stepBranding'] as const;

function resolveLogoUrl(url: string | undefined): string {
  if (!url) return '';
  return url.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${url}`
    : url;
}

type AcademyEditModalProps = {
  academy: Academy | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    data: {
      name: string;
      slug: string;
      publicAddress: string;
      description: string;
      logoId?: string;
      faviconId?: string;
      primaryColor?: string;
    }
  ) => Promise<void>;
  t: (k: string) => string;
};

export function AcademyEditModal({
  academy,
  onClose,
  onSubmit,
  t
}: AcademyEditModalProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0 — Details
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownSlug, setOwnSlug] = useState('');
  const [publicAddress, setPublicAddress] = useState('');
  const [description, setDescription] = useState('');
  const {
    status: slugStatus,
    check: checkSlug,
    reset: resetSlug
  } = useSlugAvailability({ ownSlug });

  // Step 1 — Branding
  const logo = useImageUpload();
  const favicon = useImageUpload();
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_BRAND_COLOR);

  // Populate all fields when the modal opens
  useEffect(() => {
    if (!academy) return;
    setStep(0);
    setName(academy.name ?? '');
    const currentSlug =
      academy.domain?.private_address ??
      academy.Domain?.private_address ??
      academy.slug ??
      '';
    setSlug(currentSlug);
    setOwnSlug(currentSlug);
    resetSlug();
    setPublicAddress(
      academy.domain?.public_address ?? academy.Domain?.public_address ?? ''
    );
    setDescription(academy.description ?? '');
    logo.reset(resolveLogoUrl(academy.logo?.publicUrl));
    favicon.reset(resolveLogoUrl(academy.favicon?.publicUrl));
    setPrimaryColor(DEFAULT_BRAND_COLOR);

    // Fetch saved theme color
    apiClient
      .getCurrentThemeConfig()
      .then((themeConfig) => {
        const saved = (themeConfig as { primary_color?: string })
          ?.primary_color;
        if (saved) setPrimaryColor(saved);
      })
      .catch(() => {});
  }, [academy, resetSlug]);

  function handleSlugChange(value: string) {
    const normalized = toSlug(value);
    setSlug(normalized);
    checkSlug(normalized);
  }

  async function handleSave() {
    if (!academy || !name.trim() || !slug.trim()) return;
    if (isSlugBlocking(slugStatus)) return;
    setSaving(true);
    try {
      await onSubmit(academy.id, {
        name,
        slug,
        publicAddress,
        description,
        logoId: logo.id ?? undefined,
        faviconId: favicon.id ?? undefined,
        primaryColor
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const stepKeys = STEPS.map((k) => t(`stores.${k}`));

  return (
    <Dialog open={!!academy} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[560px]" dir="rtl">
        <DialogHeader className="text-right">
          <p className="text-xs text-muted-foreground">
            {t('stores.editAcademy')}
          </p>
          <DialogTitle className="text-xl">
            {t('stores.editModalHeading')}
          </DialogTitle>
        </DialogHeader>

        {/* Step tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
          {stepKeys.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                i === step
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-background/50'
              )}
            >
              <span className="bg-current/20 mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold">
                {i + 1}
              </span>{' '}
              {label}
            </button>
          ))}
        </div>

        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('stores.academyName')}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('stores.academyNamePlaceholder')}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SlugField
                value={slug}
                status={slugStatus}
                onChange={handleSlugChange}
                t={t}
              />

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('stores.publicDomainOptional')}
                </label>
                <Input
                  value={publicAddress}
                  onChange={(e) => setPublicAddress(e.target.value)}
                  placeholder={t('stores.publicDomainPlaceholder')}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('stores.shortDescription')}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('stores.shortDescriptionPlaceholder')}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 1 — Branding */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid items-stretch gap-4 sm:grid-cols-2">
              <ImageUploadField
                label={t('stores.brandingLogo')}
                hint={t('stores.brandingLogoHint')}
                replaceHint={t('stores.brandingReplaceHint')}
                previewUrl={logo.preview}
                uploading={logo.uploading}
                onFile={logo.upload}
              />

              <ImageUploadField
                label={t('stores.brandingFavicon')}
                hint={t('stores.brandingFaviconHint')}
                replaceHint={t('stores.brandingReplaceHint')}
                previewUrl={favicon.preview}
                uploading={favicon.uploading}
                onFile={favicon.upload}
              />
            </div>

            <BrandColorPicker
              value={primaryColor}
              onChange={setPrimaryColor}
              label={t('stores.brandingColor')}
              customLabel={t('stores.brandingColorCustom')}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            {t('stores.cancel')}
          </button>

          <Button
            onClick={handleSave}
            disabled={
              saving ||
              !name.trim() ||
              !slug.trim() ||
              isSlugBlocking(slugStatus)
            }
          >
            {saving && <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />}
            {t('stores.saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
