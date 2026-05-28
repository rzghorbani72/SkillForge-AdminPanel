'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
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

interface BlockEditorProps {
  block: UIBlockConfig | null;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
}

export function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);

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

      {block.type === 'hero' && (
        <div className="space-y-3">
          {/* Background type */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Background
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['gradient', 'solid', 'image'] as HeroBgType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('bgType', type)}
                  className={`rounded border py-1.5 text-xs font-medium capitalize transition-colors ${
                    heroBgType === type
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Solid color picker */}
          {heroBgType === 'solid' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Color</Label>
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
                <span>{isUploading ? 'Uploading…' : 'Upload Image'}</span>
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
                  <Label className="text-xs">Overlay</Label>
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
            <Label className="text-xs">Secondary Button</Label>
            <Input
              value={(cfg.ctaSecondary as string) ?? ''}
              onChange={(e) => set('ctaSecondary', e.target.value)}
              placeholder="Optional secondary button"
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          {/* Layout */}
          <div className="space-y-1.5">
            <Label className="text-xs">Height</Label>
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
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Alignment</Label>
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
                  {align}
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
    </div>
  );
}
