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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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

function categoryLabelKey(key: string) {
  return `stores.category${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

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
      <DialogContent
        dir="rtl"
        className="gap-0 rounded-2xl sm:max-w-3xl sm:p-8"
      >
        <DialogHeader className="space-y-1.5 text-start">
          <DialogTitle className="text-xl font-semibold">
            {t('stores.createModalHeading')}
          </DialogTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            {t('stores.createModalSubtitle')}
          </p>
        </DialogHeader>

        {/* Two columns keep the dialog short: what the academy is on one side,
            how it looks on the other. */}
        <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-12">
          <div className="space-y-5 sm:col-span-7">
            <p className="text-xs font-medium text-muted-foreground">
              {t('stores.sectionIdentity')}
            </p>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
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

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                {t('stores.mainCategory')}
                <span className="ms-1.5 font-normal text-muted-foreground">
                  {t('stores.optionalTag')}
                </span>
              </label>
              <Select dir="rtl" value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label={t('stores.mainCategory')}>
                  <SelectValue placeholder={t('stores.categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(categoryLabelKey(key))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                {t('stores.shortDescription')}
                <span className="ms-1.5 font-normal text-muted-foreground">
                  {t('stores.optionalTag')}
                </span>
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

          {/* A hairline instead of a filled panel: it separates branding from
              the identity fields without adding another box to read. */}
          <div className="space-y-5 sm:col-span-5 sm:border-s sm:border-border/60 sm:ps-8">
            <p className="text-xs font-medium text-muted-foreground">
              {t('stores.sectionBranding')}
              <span className="ms-1.5">{t('stores.optionalTag')}</span>
            </p>

            <div className="grid items-stretch gap-4 sm:grid-cols-2">
              <ImageUploadField
                size="sm"
                label={t('stores.brandingLogo')}
                hint={t('stores.brandingLogoHint')}
                replaceHint={t('stores.brandingReplaceHint')}
                previewUrl={logo.preview}
                uploading={logo.uploading}
                onFile={logo.upload}
              />

              <ImageUploadField
                size="sm"
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
        </div>

        <DialogFooter className="mt-7 flex-row justify-end gap-3 border-t border-border/60 pt-5 sm:space-x-0">
          <button
            type="button"
            disabled={saving}
            onClick={handleClose}
            className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
          >
            {t('stores.cancel')}
          </button>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="inline-flex h-11 min-w-[10rem] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.create')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
