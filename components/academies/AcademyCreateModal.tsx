'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
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
import { apiClient } from '@/lib/api';
import { SlugField } from '@/components/academies/slug-field';
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
  /**
   * The onboarding flow has no panel behind it to go back to — a manager owning
   * no academy must finish this form, so the dialog cannot be dismissed there.
   */
  dismissible?: boolean;
};

export function AcademyCreateModal({
  open,
  onClose,
  onSubmit,
  t,
  dismissible = true
}: AcademyCreateModalProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(BRAND_COLORS[0].hex);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const {
    status: slugStatus,
    check: checkSlug,
    reset: resetSlug
  } = useSlugAvailability();

  const canSubmit =
    name.trim().length >= 2 &&
    slug.trim().length >= 2 &&
    !isSlugBlocking(slugStatus) &&
    !uploadingLogo &&
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

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    try {
      const uploaded = await apiClient.uploadImage(file);
      const imageData = (uploaded as { data?: { id?: string } })?.data;
      if (imageData?.id) setLogoId(String(imageData.id));
    } catch {
      setLogoPreview('');
      setLogoId(null);
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleClose() {
    resetSlug();
    setName('');
    setSlug('');
    setDescription('');
    setCategory('');
    setLogoId(null);
    setLogoPreview('');
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
        logoId: logoId ?? undefined,
        primaryColor
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && dismissible && handleClose()}
    >
      <DialogContent
        dir="rtl"
        hideCloseButton={!dismissible}
        onInteractOutside={(e) => !dismissible && e.preventDefault()}
        onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
        className="beautiful-scrollbar max-h-[90vh] gap-5 overflow-y-auto rounded-2xl sm:max-w-[560px]"
      >
        <DialogHeader className="text-right">
          <p className="text-xs text-muted-foreground">
            {t('stores.createModalTitle')}
          </p>
          <DialogTitle className="text-xl">
            {t('stores.createModalHeading')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t('stores.brandingLogo')}
            </label>
            <button
              type="button"
              disabled={uploadingLogo}
              onClick={() => logoInputRef.current?.click()}
              className="flex h-28 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingLogo ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : logoPreview ? (
                <img
                  src={logoPreview}
                  alt={t('stores.brandingLogo')}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <p className="px-2 text-center text-xs text-muted-foreground">
                    {t('stores.brandingLogoHint')}
                  </p>
                </>
              )}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              aria-label={t('stores.brandingLogo')}
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

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
            <p className="mt-2 text-xs text-muted-foreground" dir="ltr">
              {primaryColor}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-3 pt-1 sm:justify-normal sm:space-x-0">
          {dismissible && (
            <button
              type="button"
              disabled={saving}
              onClick={handleClose}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] border border-border text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {t('stores.cancel')}
            </button>
          )}

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
