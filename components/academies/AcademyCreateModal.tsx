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
import { useImageUpload } from '@/hooks/use-image-upload';
import { toSlug } from '@/lib/slug';
import {
  isSlugBlocking,
  useSlugAvailability
} from '@/hooks/use-slug-availability';
import type { AcademyCreateInput } from '@/lib/academy-create';

const BRAND_COLORS: { hex: string; tw: string }[] = [
  { hex: '#6366f1', tw: 'bg-[#6366f1]' },
  { hex: '#8b5cf6', tw: 'bg-[#8b5cf6]' },
  { hex: '#ec4899', tw: 'bg-[#ec4899]' },
  { hex: '#ef4444', tw: 'bg-[#ef4444]' },
  { hex: '#f97316', tw: 'bg-[#f97316]' },
  { hex: '#eab308', tw: 'bg-[#eab308]' },
  { hex: '#22c55e', tw: 'bg-[#22c55e]' },
  { hex: '#14b8a6', tw: 'bg-[#14b8a6]' },
  { hex: '#06b6d4', tw: 'bg-[#06b6d4]' },
  { hex: '#3b82f6', tw: 'bg-[#3b82f6]' },
  { hex: '#64748b', tw: 'bg-[#64748b]' },
  { hex: '#1e293b', tw: 'bg-[#1e293b]' }
];

const CATEGORY_KEYS = [
  'programming',
  'design',
  'language',
  'business',
  'entrance',
  'art',
  'finance'
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
  const [primaryColor, setPrimaryColor] = useState(BRAND_COLORS[0].hex);
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
    setPrimaryColor(BRAND_COLORS[0].hex);
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

        {/* Three columns: the short settings share the top row so branding and
            description fit without a scrollbar. */}
        <div className="grid gap-4 sm:grid-cols-3">
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

          <div>
            <label className="mb-2 block text-sm font-medium">
              {t('stores.brandingColor')}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {BRAND_COLORS.map(({ hex, tw }) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={hex}
                  onClick={() => setPrimaryColor(hex)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                    tw,
                    primaryColor === hex
                      ? 'scale-110 border-foreground shadow-md'
                      : 'border-transparent'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="mb-2 block text-sm font-medium">
              {t('stores.mainCategory')}
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(category === key ? '' : key)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    category === key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  )}
                >
                  {t(
                    `stores.category${key.charAt(0).toUpperCase()}${key.slice(1)}`
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
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

          <ImageUploadField
            label={t('stores.brandingLogo')}
            hint={t('stores.brandingLogoHint')}
            previewUrl={logo.preview}
            uploading={logo.uploading}
            onFile={logo.upload}
          />

          <ImageUploadField
            size="sm"
            label={t('stores.brandingFavicon')}
            hint={t('stores.brandingFaviconHint')}
            previewUrl={favicon.preview}
            uploading={favicon.uploading}
            onFile={favicon.upload}
          />
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
