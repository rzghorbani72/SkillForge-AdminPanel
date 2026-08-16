'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
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
import type { AcademyCreateInput } from '@/lib/academy-create';

const CATEGORY_KEYS = [
  'language',
  'entrance',
  'programming',
  'design',
  'business',
  'marketing',
  'finance',
  'art',
  'music',
  'math',
  'science',
  'medical',
  'sport',
  'photography',
  'kids',
  'other'
] as const;

type AcademyCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AcademyCreateInput) => Promise<void>;
  t: (k: string) => string;
};

export function AcademyCreateModal({
  open,
  onClose,
  onSubmit,
  t
}: AcademyCreateModalProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const logo = useImageUpload();
  const favicon = useImageUpload();
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_BRAND_COLOR);
  const {
    status: slugStatus,
    check: checkSlug,
    reset: resetSlug
  } = useSlugAvailability();

  const canSubmit =
    name.trim().length >= 2 &&
    slug.trim().length >= 2 &&
    !isSlugBlocking(slugStatus) &&
    !logo.uploading &&
    !favicon.uploading &&
    !saving;

  function handleNameChange(value: string) {
    setName(value);
    const newSlug = toSlug(value);
    setSlug(newSlug);
    checkSlug(newSlug);
  }

  function handleSlugChange(value: string) {
    const normalized = toSlug(value);
    setSlug(normalized);
    checkSlug(normalized);
  }

  function handleClose() {
    resetSlug();
    setName('');
    setSlug('');
    setDescription('');
    setCategory('');
    logo.reset();
    favicon.reset();
    setPrimaryColor(DEFAULT_BRAND_COLOR);
    onClose();
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onSubmit({
        name,
        slug,
        description,
        category,
        logoId: logo.id ?? undefined,
        faviconId: favicon.id ?? undefined,
        primaryColor
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent dir="rtl" className="gap-5 rounded-2xl sm:max-w-3xl">
        <DialogHeader className="text-right">
          <p className="text-xs text-muted-foreground">
            {t('stores.createModalTitle')}
          </p>
          <DialogTitle className="text-xl">
            {t('stores.createModalHeading')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Identity — name and address stay on one row so the address is read
              as a consequence of the name it is generated from. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('stores.academyName')}
              </label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t('stores.academyNamePlaceholder')}
                autoFocus
              />
            </div>
            <SlugField
              value={slug}
              status={slugStatus}
              onChange={handleSlugChange}
              t={t}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {t('stores.mainCategory')}
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={category === key}
                  onClick={() => setCategory(category === key ? '' : key)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    category === key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {t(
                    `stores.category${key.charAt(0).toUpperCase()}${key.slice(1)}`
                  )}
                </button>
              ))}
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
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Branding — the two uploads share one row and one height so they
              read as a pair. */}
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
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

            <div className="mt-4 border-t border-border/70 pt-4">
              <BrandColorPicker
                value={primaryColor}
                onChange={setPrimaryColor}
                label={t('stores.brandingColor')}
                customLabel={t('stores.brandingColorCustom')}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-3 pt-1 sm:justify-normal sm:space-x-0">
          <button
            type="button"
            disabled={saving}
            onClick={handleClose}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] border border-border text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {t('stores.cancel')}
          </button>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t('common.create')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
