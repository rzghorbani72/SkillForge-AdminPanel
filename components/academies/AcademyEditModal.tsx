'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
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
import { toSlug } from '@/lib/slug';
import {
  isSlugBlocking,
  useSlugAvailability
} from '@/hooks/use-slug-availability';
import type { Academy } from '@/types/api';

const STEPS = ['stepSpecs', 'stepBranding'] as const;

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
  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(BRAND_COLORS[0].hex);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Populate all fields when the modal opens
  useEffect(() => {
    if (!academy) return;
    setStep(0);
    setLogoId(null);
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
    setLogoPreview(resolveLogoUrl(academy.logo?.publicUrl));
    setPrimaryColor(BRAND_COLORS[0].hex);

    // Fetch saved theme color
    apiClient
      .getCurrentThemeConfig()
      .then((themeConfig) => {
        const saved = (themeConfig as { primary_color?: string })
          ?.primary_color;
        if (saved) {
          const match = BRAND_COLORS.find((c) => c.hex === saved);
          setPrimaryColor(match ? match.hex : saved);
        }
      })
      .catch(() => {});
  }, [academy, resetSlug]);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    try {
      const uploaded = await apiClient.uploadImage(file);
      const imageData = (uploaded as any)?.data ?? uploaded;
      if (imageData?.id) setLogoId(String(imageData.id));
    } catch {
      setLogoPreview(resolveLogoUrl(academy?.logo?.publicUrl));
      setLogoId(null);
    } finally {
      setUploadingLogo(false);
    }
  }

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
        logoId: logoId ?? undefined,
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
            <div>
              <label className="mb-2 block text-sm font-medium">
                {t('stores.brandingLogo')}
              </label>
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="logo preview"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
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
              <p className="mt-2 text-xs text-muted-foreground">
                {primaryColor}
              </p>
            </div>
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
