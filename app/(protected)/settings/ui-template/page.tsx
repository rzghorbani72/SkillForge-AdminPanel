'use client';

import { useEffect, useState } from 'react';
import { X, Pencil, LayoutTemplate, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useUserStore } from '@/lib/store';
import type { TemplatePreset } from '@/types/api';
import { DESIGN_SYSTEMS } from '@/lib/design-systems';
import { TemplatePreview } from '@/components/ui-template/template-preview';
import {
  buildEmbedPreviewUrl,
  resolveStorefrontBaseUrl
} from '@/lib/ui-template/preview-url';

const PRESET_TAGS: Record<string, string> = {
  kajabi: 'ادیتوریال گرم',
  podia: 'استودیویی خلاق',
  stan: 'سینماتیک لوکس',
  circle: 'کاربردی',
  rocket: 'برنامه‌نویسی حرفه‌ای',
  modern: 'مدرن تمبر',
  classic: 'کلاسیک',
  minimal: 'مینیمال',
  academy: 'آکادمیک',
  'student-focused': 'دانشجو‌محور',
  'courses-first': 'دوره‌محور',
  compact: 'فشرده',
  featured: 'ویژه'
};

const NEW_PRESETS = new Set(['stan', 'rocket', 'modern']);

export default function UITemplateSettingsPage() {
  const user = useUserStore((s) => s.user);

  const [presets, setPresets] = useState<TemplatePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(
    null
  );
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [templateData, presetsData] = await Promise.all([
          apiClient.getCurrentUITemplate().catch(() => null),
          apiClient.getAvailableTemplatePresets().catch(() => [])
        ]);
        setPresets(presetsData as TemplatePreset[]);
        setActivePresetId(
          ((templateData as Record<string, unknown>)
            ?.template_preset as string) ?? ''
        );
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleCardClick = async (preset: TemplatePreset) => {
    setSelectedPreset(preset);
    setIframeSrc(null);
    setIsApplied(false);
    setIsPreviewLoading(true);

    try {
      await apiClient.applyTemplatePreset(preset.id);
      const session = await apiClient.getTemplatePreviewSession();
      setIframeSrc(
        buildEmbedPreviewUrl(
          session.token,
          session.previewPath,
          session.storefrontBaseUrl
        )
      );
      setActivePresetId(preset.id);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setSelectedPreset(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirmSelect = () => {
    setIsApplied(true);
    ErrorHandler.showSuccess('قالب با موفقیت انتخاب شد');
  };

  const handleClosePreview = () => {
    setSelectedPreset(null);
    setIframeSrc(null);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-full bg-stone-50 p-8" dir="rtl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <Skeleton className="mb-3 h-8 w-44" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-52 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Preview mode ─────────────────────────────────────────────────────────────
  if (selectedPreset) {
    const ds = DESIGN_SYSTEMS[selectedPreset.id];
    const tag = PRESET_TAGS[selectedPreset.id];

    return (
      <div className="flex h-full flex-col overflow-hidden">
        {/* Action bar */}
        <div className="flex flex-shrink-0 items-center gap-3 bg-zinc-900 px-4 py-2.5">
          <Button
            size="sm"
            onClick={handleConfirmSelect}
            disabled={isApplied}
            className="h-8 gap-1.5 bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-70"
          >
            {isApplied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                انتخاب شد
              </>
            ) : (
              'انتخاب این قالب'
            )}
          </Button>

          {ds && (
            <div className="flex items-center gap-1.5">
              {[ds.colors.primary, ds.colors.secondary, ds.colors.accent].map(
                (c, i) => (
                  <span
                    key={i}
                    className="h-4 w-4 rounded-full border-2 border-zinc-700 shadow-sm"
                    style={{ background: c }}
                  />
                )
              )}
              <span className="mx-1 h-3 w-px bg-zinc-700" />
              <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-700 text-[8px] leading-none text-zinc-400">
                Aa
              </span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-4">
            {tag && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                style={{ background: ds?.colors.primary ?? '#6b7280' }}
              >
                {tag}
              </span>
            )}

            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[11px] text-zinc-400">پیش‌نمایش زنده</span>
            </div>

            <span className="text-sm font-semibold text-white">
              {selectedPreset.name}
            </span>

            <button
              type="button"
              title="بستن پیش‌نمایش"
              onClick={handleClosePreview}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Iframe area */}
        <div className="relative flex-1 bg-zinc-950">
          {isPreviewLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-500">
                  در حال بارگذاری پیش‌نمایش...
                </p>
              </div>
            </div>
          )}
          {iframeSrc && (
            <iframe
              src={iframeSrc}
              className="h-full w-full border-0"
              title={`Preview: ${selectedPreset.name}`}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Gallery mode ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#f2ece4] p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            قالب‌های آماده
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            یک قالب کامل فارسی انتخاب کنید تا پیش‌نمایش کامل ببینید — مستقیم روی
            آن کلیک کنید
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background p-1 shadow-sm">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60"
          >
            <Pencil className="h-3.5 w-3.5" />
            ساز قالب
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            قالب‌های آماده
          </button>
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {presets.map((preset) => (
          <GalleryCard
            key={preset.id}
            preset={preset}
            isActive={preset.id === activePresetId}
            isNew={NEW_PRESETS.has(preset.id)}
            onClick={() => handleCardClick(preset)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────────────────

interface GalleryCardProps {
  preset: TemplatePreset;
  isActive: boolean;
  isNew: boolean;
  onClick: () => void;
}

function GalleryCard({ preset, isActive, isNew, onClick }: GalleryCardProps) {
  const ds = DESIGN_SYSTEMS[preset.id];
  const tag = PRESET_TAGS[preset.id];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background text-right shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Thumbnail — clips the SVG mockup to show a zoomed-out page view */}
      <div className="relative h-44 overflow-hidden bg-gray-50">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
          <div
            className="w-[200%] origin-top-left transition-transform duration-300 group-hover:scale-[1.03]"
            style={{
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
              width: '200%'
            }}
          >
            <TemplatePreview preset={preset} />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex gap-1.5">
          {isNew && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
              جدید
            </span>
          )}
          {isActive && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
              فعال
            </span>
          )}
        </div>
      </div>

      {/* Card info */}
      <div className="px-3 pb-3 pt-2.5">
        {/* Color dots + category tag */}
        <div className="mb-2 flex items-center gap-1.5">
          {ds && (
            <div className="flex items-center gap-1">
              {[ds.colors.primary, ds.colors.secondary, ds.colors.accent].map(
                (c, i) => (
                  <span
                    key={i}
                    className="ring-black/8 h-3.5 w-3.5 flex-shrink-0 rounded-full border border-white/30 shadow-sm ring-1"
                    style={{ background: c }}
                  />
                )
              )}
            </div>
          )}
          {tag && (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
              style={{
                background: ds ? `${ds.colors.primary}1a` : '#f3f4f6',
                color: ds?.colors.primary ?? '#6b7280'
              }}
            >
              {tag}
            </span>
          )}
        </div>

        {/* Template name */}
        <p className="text-sm font-bold text-foreground">{preset.name}</p>

        {/* Description */}
        {preset.description && (
          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
            {preset.description}
          </p>
        )}
      </div>
    </button>
  );
}
