'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, Check, Loader2, Wand2, LayoutTemplate, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useUserStore } from '@/lib/store';
import type { TemplatePreset, UIBlockConfig } from '@/types/api';
import { getDesignSystem, buildThemePayload } from '@/lib/design-systems';
import { TemplatePreview } from '@/components/ui-template/template-preview';
import {
  buildEmbedPreviewUrl,
  appendPreviewCacheBuster
} from '@/lib/ui-template/preview-url';
import { buildThemeDraftFromPrimary } from '@/lib/ui-template/theme-draft-payload';
import { TemplateCustomizationSidebar } from '@/components/ui-template/template-customization-sidebar';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

type BorderRadius = 'sharp' | 'soft' | 'rounded';
type Shadow = 'none' | 'subtle' | 'medium' | 'strong';
type SectionSpacing = 'compact' | 'comfortable' | 'spacious';
type ContainerWidth = 'narrow' | 'standard' | 'wide' | 'full';
type HeadingScale = 'compact' | 'standard' | 'large';

export default function UITemplateSettingsPage() {
  const user = useUserStore((s) => s.user);

  const [presets, setPresets] = useState<TemplatePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(
    null
  );
  const [baseIframeSrc, setBaseIframeSrc] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Customizer state
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [borderRadius, setBorderRadius] = useState<BorderRadius>('soft');
  const [shadow, setShadow] = useState<Shadow>('medium');
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [sectionSpacing, setSectionSpacing] =
    useState<SectionSpacing>('comfortable');
  const [containerWidth, setContainerWidth] =
    useState<ContainerWidth>('standard');
  const [headingScale, setHeadingScale] = useState<HeadingScale>('standard');
  const [draftBlocks, setDraftBlocks] = useState<UIBlockConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const iframeSrc = baseIframeSrc
    ? appendPreviewCacheBuster(baseIframeSrc, refreshKey)
    : null;

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
    setBaseIframeSrc(null);
    setRefreshKey(0);
    setIsApplied(false);
    setShowCustomizer(false);
    setIsPreviewLoading(true);

    // Seed customizer defaults from design system
    const ds = getDesignSystem(preset.id);
    if (ds) {
      setPrimaryColor(ds.colors.primary);
      setBorderRadius(ds.shape.borderRadius);
      setShadow(ds.shape.shadow);
      setDarkMode(ds.darkMode);
    }
    setDraftBlocks(preset.blocks);

    try {
      await apiClient.applyTemplatePreset(preset.id);

      // Seed the draft theme from the preset's design system so the live
      // preview renders in the template's own palette (name is left untouched).
      const { name: _omitName, ...themeSeed } = buildThemePayload(ds);
      await apiClient.saveThemeDraft(themeSeed);

      const [session, themeRaw] = await Promise.all([
        apiClient.getTemplatePreviewSession(),
        apiClient.getCurrentThemeConfig().catch(() => null)
      ]);

      // Keep design-size tokens from the saved theme — they are not part of
      // the preset palette and should survive a template switch.
      const theme = themeRaw as Record<string, unknown> | null;
      if (theme) {
        if (theme.section_spacing)
          setSectionSpacing(theme.section_spacing as SectionSpacing);
        if (theme.container_width)
          setContainerWidth(theme.container_width as ContainerWidth);
        if (theme.heading_scale)
          setHeadingScale(theme.heading_scale as HeadingScale);
      }

      setBaseIframeSrc(
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
    setBaseIframeSrc(null);
    setShowCustomizer(false);
  };

  // ── Draft save helpers ──────────────────────────────────────────────────────

  const saveThemeDraft = useCallback(
    async (color: string, br: BorderRadius, sh: Shadow, dm: boolean | null) => {
      setIsSaving(true);
      try {
        const payload = buildThemeDraftFromPrimary(color, {
          borderRadius: br,
          shadow: sh,
          backgroundSvgPattern: ''
        });
        await apiClient.saveThemeDraft({ ...payload, dark_mode: dm });
        setRefreshKey((k) => k + 1);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const saveBlocksDraft = useCallback(async (blocks: UIBlockConfig[]) => {
    setIsSaving(true);
    try {
      await apiClient.saveUITemplateDraft({ blocks });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const debouncedSaveTheme = useDebouncedCallback(saveThemeDraft, 800);
  const debouncedSaveBlocks = useDebouncedCallback(saveBlocksDraft, 800);

  // ── Customizer handlers ─────────────────────────────────────────────────────

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    debouncedSaveTheme(color, borderRadius, shadow, darkMode);
  };

  const handleBorderRadiusChange = (br: BorderRadius) => {
    setBorderRadius(br);
    debouncedSaveTheme(primaryColor, br, shadow, darkMode);
  };

  const handleDarkModeChange = (dm: boolean | null) => {
    setDarkMode(dm);
    debouncedSaveTheme(primaryColor, borderRadius, shadow, dm);
  };

  const handleDesignSizeChange = (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => {
    if (patch.section_spacing) setSectionSpacing(patch.section_spacing);
    if (patch.container_width) setContainerWidth(patch.container_width);
    if (patch.heading_scale) setHeadingScale(patch.heading_scale);
    setIsSaving(true);
    apiClient
      .saveThemeDraft(patch)
      .then(() => setRefreshKey((k) => k + 1))
      .catch((error) => ErrorHandler.handleApiError(error))
      .finally(() => setIsSaving(false));
  };

  const handleBlocksChange = (blocks: UIBlockConfig[]) => {
    setDraftBlocks(blocks);
    debouncedSaveBlocks(blocks);
  };

  const handleBannerImageChange = (url: string) => {
    const updated = draftBlocks.map((b) =>
      b.type === 'hero' || b.type === 'slideshow'
        ? {
            ...b,
            config: {
              ...(b.config ?? {}),
              backgroundImage: url,
              bgImage: url,
              bgType: 'image'
            }
          }
        : b
    );
    setDraftBlocks(updated);
    debouncedSaveBlocks(updated);
  };

  const handleReset = async () => {
    if (!selectedPreset) return;
    const ds = getDesignSystem(selectedPreset.id);
    if (ds) {
      setPrimaryColor(ds.colors.primary);
      setBorderRadius(ds.shape.borderRadius);
      setShadow(ds.shape.shadow);
      setDarkMode(ds.darkMode);
      await saveThemeDraft(
        ds.colors.primary,
        ds.shape.borderRadius,
        ds.shape.shadow,
        ds.darkMode
      );
    }
    setDraftBlocks(selectedPreset.blocks);
    await saveBlocksDraft(selectedPreset.blocks);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────

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

  // ── Preview mode ──────────────────────────────────────────────────────────

  if (selectedPreset) {
    const ds = getDesignSystem(selectedPreset.id);

    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-zinc-950">
        {/* Action bar */}
        <div className="flex flex-shrink-0 items-center gap-2 bg-zinc-900 px-4 py-2.5">
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

          <Button
            size="sm"
            onClick={() => setShowCustomizer((v) => !v)}
            className={`h-8 gap-1.5 px-3 text-xs font-semibold ${
              showCustomizer
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
            }`}
          >
            <Wand2 className="h-3.5 w-3.5" />
            سفارشی‌سازی
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
            </div>
          )}

          <div className="ml-auto flex items-center gap-4">
            {ds.tagline && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                style={{ background: ds.colors.primary }}
              >
                {ds.tagline}
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

        {/* Content: sidebar + iframe */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {showCustomizer && (
            <TemplateCustomizationSidebar
              primaryColor={primaryColor}
              borderRadius={borderRadius}
              shadow={shadow}
              darkMode={darkMode}
              sectionSpacing={sectionSpacing}
              containerWidth={containerWidth}
              headingScale={headingScale}
              blocks={draftBlocks}
              isSaving={isSaving}
              onColorChange={handleColorChange}
              onBorderRadiusChange={handleBorderRadiusChange}
              onDarkModeChange={handleDarkModeChange}
              onDesignSizeChange={handleDesignSizeChange}
              onBlocksChange={handleBlocksChange}
              onBannerImageChange={handleBannerImageChange}
              onReset={handleReset}
              onClose={() => setShowCustomizer(false)}
            />
          )}

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
                key={iframeSrc}
                src={iframeSrc}
                className="h-full w-full border-0"
                title={`Preview: ${selectedPreset.name}`}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Gallery mode ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-[#f2ece4] p-8" dir="rtl">
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

      {presets.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 text-center">
          <LayoutTemplate className="mb-4 h-10 w-10 text-muted-foreground/60" />
          <h2 className="text-lg font-semibold text-foreground">
            هنوز قالبی تعریف نشده
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            کاتالوگ قالب‌های آماده خالی است. پس از افزودن قالب‌های جدید، اینجا
            نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {presets.map((preset) => (
            <GalleryCard
              key={preset.id}
              preset={preset}
              isActive={preset.id === activePresetId}
              onClick={() => handleCardClick(preset)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────────────────

interface GalleryCardProps {
  preset: TemplatePreset;
  isActive: boolean;
  onClick: () => void;
}

function GalleryCard({ preset, isActive, onClick }: GalleryCardProps) {
  const ds = getDesignSystem(preset.id);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background text-right shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
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
        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
        <div className="absolute left-2 top-2 flex gap-1.5">
          {isActive && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
              فعال
            </span>
          )}
        </div>
      </div>

      <div className="px-3 pb-3 pt-2.5">
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
          {ds.tagline && (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
              style={{
                background: `${ds.colors.primary}1a`,
                color: ds.colors.primary
              }}
            >
              {ds.tagline}
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-foreground">{preset.name}</p>
        {preset.description && (
          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
            {preset.description}
          </p>
        )}
      </div>
    </button>
  );
}
