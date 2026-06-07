'use client';

import { useMemo, useState } from 'react';
import { Upload, X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { UIBlockConfig } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';

type HeroBgType = 'gradient' | 'solid' | 'image';
type HeroMode = 'illustration' | 'slideshow';

type MediaSize = 'sm' | 'md' | 'lg' | 'full';
type MediaAspect = '16:9' | '4:3' | '1:1' | 'auto';

const MEDIA_ASPECTS: MediaAspect[] = ['16:9', '4:3', '1:1', 'auto'];

// Allowed media sizes per block type — mirrors the backend section-catalog image
// slots. Bounded enums only; never a freeform px input.
const BLOCK_SLOT_SIZES: Record<string, MediaSize[]> = {
  hero: ['sm', 'md', 'lg', 'full'],
  testimonials: ['sm', 'md'],
  features: ['sm', 'md'],
  header: ['sm', 'md'],
  footer: ['sm', 'md']
};

function MediaControls({
  blockType,
  cfg,
  set,
  label
}: {
  blockType: string;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  label: string;
}) {
  const sizes = BLOCK_SLOT_SIZES[blockType];
  if (!sizes) return null;
  const size = (cfg.mediaSize as MediaSize) ?? sizes[sizes.length - 1];
  const aspect = (cfg.mediaAspect as MediaAspect) ?? '4:3';

  return (
    <div className="space-y-2 rounded-md border border-dashed p-2.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Size
        </span>
        <div className="flex gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set('mediaSize', s)}
              className={`flex-1 rounded border py-1 text-[11px] font-medium uppercase transition-colors ${
                size === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Aspect
        </span>
        <div className="flex gap-1.5">
          {MEDIA_ASPECTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => set('mediaAspect', a)}
              className={`flex-1 rounded border py-1 text-[11px] font-medium transition-colors ${
                aspect === a
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const ILLUSTRATION_PRESETS = [
  {
    id: 'person-learning',
    label: 'Learning',
    emoji: '📖',
    hint: 'Reading & studying'
  },
  { id: 'person-laptop', label: 'Online', emoji: '💻', hint: 'Digital & tech' },
  {
    id: 'person-teaching',
    label: 'Teaching',
    emoji: '🎓',
    hint: 'Expert & mentor'
  },
  {
    id: 'person-thinking',
    label: 'Thinking',
    emoji: '💡',
    hint: 'Questions & ideas'
  },
  {
    id: 'person-achievement',
    label: 'Success',
    emoji: '🏆',
    hint: 'Goals & results'
  },
  { id: 'person-team', label: 'Team', emoji: '🤝', hint: 'Community & collab' }
] as const;

const SLIDE_GRADIENTS = [
  { label: 'Ocean', value: 'from-indigo-600 via-blue-600 to-cyan-500' },
  { label: 'Violet', value: 'from-violet-600 via-purple-600 to-pink-500' },
  { label: 'Sunset', value: 'from-rose-600 via-pink-500 to-orange-400' },
  { label: 'Forest', value: 'from-emerald-600 via-teal-500 to-cyan-500' },
  { label: 'Dark', value: 'from-gray-900 via-slate-800 to-gray-700' },
  { label: 'Gold', value: 'from-amber-500 via-orange-500 to-rose-500' }
];

interface SlideItem {
  id: string;
  image?: string | null;
  gradient: string;
  title?: string;
  subtitle?: string;
}

interface SlideshowEditorProps {
  blockId: string;
  cfg: Record<string, unknown>;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
}

function SlideshowEditor({ blockId, cfg, onUpdate }: SlideshowEditorProps) {
  const { t } = useTranslation();
  const [expandedSlide, setExpandedSlide] = useState<number>(0);
  const [isUploadingSlide, setIsUploadingSlide] = useState<number | null>(null);

  const defaultSlides = useMemo(
    (): SlideItem[] =>
      SLIDE_GRADIENTS.slice(0, 4).map((g, i) => ({
        id: String(i + 1),
        gradient: g.value,
        title: t('settings.slideDefaultTitle', { n: i + 1 }),
        subtitle: t('settings.slideDefaultSubtitle')
      })),
    [t]
  );

  const slides: SlideItem[] = (cfg.slides as SlideItem[]) ?? defaultSlides;
  const isBanner = slides.length === 1;

  const setSlides = (next: SlideItem[]) =>
    onUpdate(blockId, { ...cfg, slides: next });

  const updateSlide = (idx: number, patch: Partial<SlideItem>) => {
    setSlides(slides.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const removeSlide = (idx: number) => {
    const next = slides.filter((_, i) => i !== idx);
    if (next.length === 0) return;
    setSlides(next);
    setExpandedSlide(Math.min(expandedSlide, next.length - 1));
  };

  const addSlide = () => {
    const gradient =
      SLIDE_GRADIENTS[slides.length % SLIDE_GRADIENTS.length].value;
    const next = [
      ...slides,
      {
        id: Date.now().toString(),
        gradient,
        title: t('settings.slideDefaultTitle', { n: slides.length + 1 })
      }
    ];
    setSlides(next);
    setExpandedSlide(next.length - 1);
  };

  const handleSlideImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingSlide(idx);
      const result = await apiClient.uploadImage(file, {
        title: `Slide ${idx + 1}`
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
        updateSlide(idx, { image: url });
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploadingSlide(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode indicator */}
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {isBanner
            ? `📌 ${t('settings.slideshowBanner')}`
            : `🎞 ${t('settings.slideshowMode', { count: slides.length })}`}
        </Label>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
          {isBanner ? 'Banner' : 'Slideshow'}
        </span>
      </div>
      <p className="text-[9px] text-muted-foreground/70">
        {t('settings.slideshowHint')}
      </p>

      <Separator />

      {/* Slide list */}
      <div className="space-y-1.5">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="overflow-hidden rounded-md border">
            {/* Slide header (clickable to expand) */}
            <button
              type="button"
              onClick={() => setExpandedSlide(expandedSlide === idx ? -1 : idx)}
              className="flex w-full items-center gap-2 px-2.5 py-2 hover:bg-accent/50"
            >
              <div
                className={`h-5 w-8 shrink-0 rounded bg-gradient-to-r ${slide.gradient}`}
              />
              <span className="flex-1 truncate text-left text-xs font-medium">
                {slide.title || t('settings.slideDefaultTitle', { n: idx + 1 })}
              </span>
              {slides.length > 1 && (
                <button
                  type="button"
                  aria-label="Remove slide"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSlide(idx);
                  }}
                  className="rounded p-0.5 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
              {expandedSlide === idx ? (
                <ChevronUp className="h-3 w-3 shrink-0" />
              ) : (
                <ChevronDown className="h-3 w-3 shrink-0" />
              )}
            </button>

            {/* Expanded editor */}
            {expandedSlide === idx && (
              <div className="space-y-2 border-t bg-muted/20 p-2.5">
                {/* Image upload / preview */}
                {slide.image ? (
                  <div className="relative overflow-hidden rounded border">
                    <img
                      src={slide.image}
                      alt={`Slide ${idx + 1}`}
                      className="h-20 w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Remove slide image"
                      onClick={() => updateSlide(idx, { image: null })}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null}
                <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary">
                  <Upload className="h-3.5 w-3.5" />
                  <span>
                    {isUploadingSlide === idx
                      ? t('settings.heroUploading')
                      : t('settings.heroUploadImage')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSlideImageUpload(e, idx)}
                    disabled={isUploadingSlide !== null}
                  />
                </label>

                {/* Gradient picker (used when no image) */}
                {!slide.image && (
                  <div className="space-y-1">
                    <Label className="text-[9px] text-muted-foreground">
                      {t('settings.slideGradient')}
                    </Label>
                    <div className="grid grid-cols-3 gap-1">
                      {SLIDE_GRADIENTS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          title={g.label}
                          onClick={() =>
                            updateSlide(idx, { gradient: g.value })
                          }
                          className={`h-7 rounded bg-gradient-to-r ${g.value} ${slide.gradient === g.value ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Title & subtitle */}
                <Input
                  value={slide.title ?? ''}
                  onChange={(e) => updateSlide(idx, { title: e.target.value })}
                  placeholder={t('settings.slideTitlePlaceholder')}
                  className="h-7 text-xs"
                />
                <Input
                  value={slide.subtitle ?? ''}
                  onChange={(e) =>
                    updateSlide(idx, { subtitle: e.target.value })
                  }
                  placeholder={t('settings.slideSubtitlePlaceholder')}
                  className="h-7 text-xs"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {slides.length < 8 && (
        <button
          type="button"
          onClick={addSlide}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('settings.addSlide')}
        </button>
      )}

      <Separator />

      {/* Height */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t('settings.heroHeight')}</Label>
        <div className="flex gap-1.5">
          {(['small', 'medium', 'large'] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onUpdate(blockId, { ...cfg, height: h })}
              className={`flex-1 rounded border py-1.5 text-xs font-medium transition-colors ${
                ((cfg.height as string) ?? 'medium') === h
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {h === 'small'
                ? t('settings.heightSmall')
                : h === 'medium'
                  ? t('settings.heightMedium')
                  : t('settings.heightLarge')}
            </button>
          ))}
        </div>
      </div>

      {/* Speed */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t('settings.slideshowSpeed')}</Label>
        <div className="flex gap-1.5">
          {(['slow', 'normal', 'fast'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onUpdate(blockId, { ...cfg, speed: s })}
              className={`flex-1 rounded border py-1.5 text-xs font-medium transition-colors ${
                ((cfg.speed as string) ?? 'normal') === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {s === 'slow'
                ? t('settings.speedSlow')
                : s === 'normal'
                  ? t('settings.speedNormal')
                  : t('settings.speedFast')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface BlockEditorProps {
  block: UIBlockConfig | null;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
  onTypeChange: (blockId: string, type: UIBlockConfig['type']) => void;
}

export function BlockEditor({
  block,
  onUpdate,
  onTypeChange
}: BlockEditorProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingIllustration, setIsUploadingIllustration] = useState(false);

  if (!block) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <svg
          className="h-8 w-8 opacity-25"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
        <p>{t('settings.selectBlockToEdit')}</p>
      </div>
    );
  }

  const cfg = block.config ?? {};

  const set = (key: string, value: unknown) =>
    onUpdate(block.id, { ...cfg, [key]: value });

  const heroBgType: HeroBgType = (cfg.bgType as HeroBgType) ?? 'gradient';

  const handleHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const result = await apiClient.uploadImage(file, {
        title: 'Hero Background'
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
        onUpdate(block.id, { ...cfg, bgImage: url, bgType: 'image' });
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleIllustrationUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingIllustration(true);
      const result = await apiClient.uploadImage(file, {
        title: 'Hero Illustration'
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
        onUpdate(block.id, { ...cfg, illustration: url });
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploadingIllustration(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('settings.editBlock')}
        </p>
        <p className="text-sm font-medium capitalize">
          {t(`settings.${block.type}` as Parameters<typeof t>[0]) || block.type}
        </p>
      </div>

      <Separator />

      {(block.type === 'hero' || block.type === 'slideshow') && (
        <div className="grid grid-cols-2 gap-1.5">
          {(['hero', 'slideshow'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onTypeChange(block.id, mode)}
              className={`rounded border py-1.5 text-xs font-medium transition-colors ${
                block.type === mode
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-accent'
              }`}
            >
              {mode === 'hero'
                ? t('settings.heroModeLabel')
                : t('settings.slideshowModeLabel')}
            </button>
          ))}
        </div>
      )}

      {block.type === 'hero' && (
        <div className="space-y-3">
          {/* Background type */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t('settings.heroBgType')}
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                {
                  type: 'gradient' as HeroBgType,
                  label: t('settings.bgTypeGradient')
                },
                {
                  type: 'solid' as HeroBgType,
                  label: t('settings.bgTypeSolid')
                },
                {
                  type: 'image' as HeroBgType,
                  label: t('settings.bgTypeImage')
                }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('bgType', type)}
                  className={`rounded border py-1.5 text-xs font-medium transition-colors ${
                    heroBgType === type
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Solid color picker */}
          {heroBgType === 'solid' && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t('settings.heroColor')}</Label>
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border shadow-sm">
                  <input
                    type="color"
                    title="Background color"
                    value={(cfg.bgColor as string) ?? '#3b82f6'}
                    onChange={(e) => set('bgColor', e.target.value)}
                    className="absolute -inset-1 h-11 w-11 cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  value={(cfg.bgColor as string) ?? '#3b82f6'}
                  onChange={(e) => set('bgColor', e.target.value)}
                  className="h-7 font-mono text-xs"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          )}

          {/* Image upload */}
          {heroBgType === 'image' && (
            <div className="space-y-2">
              {cfg.bgImage ? (
                <div className="relative overflow-hidden rounded-md border">
                  <img
                    src={cfg.bgImage as string}
                    alt="Hero background"
                    className="h-20 w-full object-cover"
                  />
                  <button
                    type="button"
                    title="Remove image"
                    aria-label="Remove image"
                    onClick={() => set('bgImage', '')}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : null}
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed py-4 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                <Upload className="h-4 w-4" />
                <span>
                  {isUploading
                    ? t('settings.heroUploading')
                    : t('settings.heroUploadImage')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroImageUpload}
                  disabled={isUploading}
                />
              </label>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{t('settings.heroOverlay')}</Label>
                  <span className="text-xs text-muted-foreground">
                    {(cfg.overlayOpacity as number) ?? 40}%
                  </span>
                </div>
                <input
                  type="range"
                  title="Overlay opacity"
                  aria-label="Overlay opacity"
                  min="0"
                  max="80"
                  value={(cfg.overlayOpacity as number) ?? 40}
                  onChange={(e) =>
                    set('overlayOpacity', Number(e.target.value))
                  }
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Text content */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.heroSection')}</Label>
            <Input
              value={(cfg.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('settings.heroSection')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.subtitle')}</Label>
            <Input
              value={(cfg.subtitle as string) ?? ''}
              onChange={(e) => set('subtitle', e.target.value)}
              placeholder={t('settings.subtitle')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.ctaText')}</Label>
            <Input
              value={(cfg.ctaText as string) ?? ''}
              onChange={(e) => set('ctaText', e.target.value)}
              placeholder={t('settings.ctaText')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.heroSecondaryBtn')}</Label>
            <Input
              value={(cfg.ctaSecondary as string) ?? ''}
              onChange={(e) => set('ctaSecondary', e.target.value)}
              placeholder={t('settings.heroSecondaryBtnPlaceholder')}
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          {/* Layout */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.heroHeight')}</Label>
            <div className="flex gap-1.5">
              {(['small', 'medium', 'large'] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => set('height', h)}
                  className={`flex-1 rounded border py-1.5 text-xs font-medium capitalize transition-colors ${
                    ((cfg.height as string) ?? 'medium') === h
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {h === 'small'
                    ? t('settings.heightSmall')
                    : h === 'medium'
                      ? t('settings.heightMedium')
                      : t('settings.heightLarge')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">{t('settings.heroAlignment')}</Label>
            <div className="flex gap-1">
              {(['center', 'left'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => set('alignment', align)}
                  className={`rounded px-2 py-1 text-xs capitalize transition-colors ${
                    ((cfg.alignment as string) ?? 'center') === align
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent'
                  }`}
                >
                  {align === 'center'
                    ? t('settings.alignCenter')
                    : t('settings.alignLeft')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">{t('settings.showCtaButton')}</Label>
            <Switch
              checked={(cfg.showCTA as boolean) ?? true}
              onCheckedChange={(v) => set('showCTA', v)}
            />
          </div>

          <Separator />

          {/* Illustration */}
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t('settings.heroIllustration')}
            </Label>

            {/* Preset picker */}
            <div className="grid grid-cols-3 gap-1">
              {ILLUSTRATION_PRESETS.map((preset) => {
                const isActive =
                  cfg.illustrationPreset === preset.id && !cfg.illustration;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.hint}
                    onClick={() =>
                      onUpdate(block.id, {
                        ...cfg,
                        illustrationPreset: preset.id,
                        illustration: null
                      })
                    }
                    className={`flex flex-col items-center gap-0.5 rounded-md border py-1.5 text-[9px] transition-colors ${
                      isActive
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <span className="text-base">{preset.emoji}</span>
                    <span className="font-medium">{preset.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                title={t('settings.heroNoIllustration')}
                onClick={() =>
                  onUpdate(block.id, {
                    ...cfg,
                    illustrationPreset: null,
                    illustration: null
                  })
                }
                className={`flex flex-col items-center gap-0.5 rounded-md border py-1.5 text-[9px] transition-colors ${
                  !cfg.illustrationPreset && !cfg.illustration
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                }`}
              >
                <span className="text-base opacity-40">✕</span>
                <span className="font-medium">
                  {t('settings.heroNoIllustrationLabel')}
                </span>
              </button>
            </div>

            {/* Custom upload preview */}
            {cfg.illustration ? (
              <div className="relative overflow-hidden rounded-md border">
                <img
                  src={cfg.illustration as string}
                  alt="Hero illustration"
                  className="h-24 w-full bg-muted/30 object-contain"
                />
                <button
                  type="button"
                  title="Remove illustration"
                  aria-label="Remove illustration"
                  onClick={() =>
                    onUpdate(block.id, { ...cfg, illustration: null })
                  }
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}

            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed py-2.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <Upload className="h-3.5 w-3.5" />
              <span>
                {isUploadingIllustration
                  ? t('settings.heroUploading')
                  : t('settings.heroUploadCustom')}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIllustrationUpload}
                disabled={isUploadingIllustration}
              />
            </label>
            <p className="text-[9px] text-muted-foreground/70">
              {t('settings.heroIllustrationHint')}
            </p>
          </div>
        </div>
      )}

      {block.type === 'features' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.featuresSection')}</Label>
            <Input
              value={(cfg.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('settings.featuresSection')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.gridColumns')}</Label>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('gridColumns', n)}
                  className={`flex-1 rounded border py-1.5 text-xs font-medium transition-colors ${
                    (cfg.gridColumns as number) === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {block.type === 'courses' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.coursesSection')}</Label>
            <Input
              value={(cfg.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('settings.coursesSection')}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.gridColumns')}</Label>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('gridColumns', n)}
                  className={`flex-1 rounded border py-1.5 text-xs font-medium transition-colors ${
                    (cfg.gridColumns as number) === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {block.type === 'header' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.header')}</Label>
            <Input
              value={(cfg.brandName as string) ?? ''}
              onChange={(e) => set('brandName', e.target.value)}
              placeholder={t('settings.header')}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      {block.type === 'testimonials' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('settings.testimonials')}</Label>
            <Input
              value={(cfg.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('settings.testimonials')}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      {block.type === 'slideshow' && (
        <SlideshowEditor blockId={block.id} cfg={cfg} onUpdate={onUpdate} />
      )}

      {(block.type === 'footer' || block.type === 'sidebar') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{t('settings.active')}</Label>
            <Switch
              checked={block.isVisible}
              onCheckedChange={(v) => set('visible', v)}
            />
          </div>
        </div>
      )}

      {BLOCK_SLOT_SIZES[block.type] && (
        <MediaControls
          blockType={block.type}
          cfg={cfg}
          set={set}
          label={t('settings.sectionImageSizing')}
        />
      )}
    </div>
  );
}
