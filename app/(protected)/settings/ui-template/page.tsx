'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  X,
  Check,
  Loader2,
  Wand2,
  LayoutTemplate,
  Pencil,
  Eye
} from 'lucide-react';
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
import { SectionLibraryModal } from '@/components/ui-template/section-library-modal';
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    blockId: string;
    type: string;
  } | null>(null);

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

  const handleConfirmSelect = async () => {
    setIsPublishing(true);
    try {
      // Publishing copies the draft (template + theme) to the live site —
      // without this, the public academy page keeps showing the previously
      // published design while the preview shows the new draft.
      await apiClient.publishSite();
      setIsApplied(true);
      ErrorHandler.showSuccess('قالب با موفقیت روی سایت منتشر شد');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsPublishing(false);
    }
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

  const handleOpenPicker = (target?: { blockId: string; type: string }) => {
    setPickerTarget(target ?? null);
    setPickerOpen(true);
  };

  // Import/swap mutate the draft server-side, so pull the canonical block list
  // back and refresh the live preview.
  const handleSectionPicked = async () => {
    try {
      const data = (await apiClient.getCurrentUITemplate()) as Record<
        string,
        unknown
      > | null;
      const blocks = (data?.draft_blocks ?? data?.blocks) as
        | UIBlockConfig[]
        | undefined;
      if (blocks) setDraftBlocks(blocks);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
            disabled={isApplied || isPublishing}
            className="h-8 gap-1.5 bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-70"
          >
            {isApplied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                منتشر شد
              </>
            ) : isPublishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                در حال انتشار...
              </>
            ) : (
              'انتشار این قالب در سایت'
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
              onOpenPicker={handleOpenPicker}
              onReset={handleReset}
              onClose={() => setShowCustomizer(false)}
            />
          )}

          <SectionLibraryModal
            open={pickerOpen}
            swapTarget={pickerTarget}
            onClose={() => setPickerOpen(false)}
            onImported={handleSectionPicked}
          />

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset, idx) => (
            <GalleryCard
              key={preset.id}
              preset={preset}
              isActive={preset.id === activePresetId}
              index={idx}
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
  index: number;
  onClick: () => void;
}

function GalleryCard({ preset, isActive, index, onClick }: GalleryCardProps) {
  const ds = getDesignSystem(preset.id);
  const swatches = [
    ds.colors.background,
    ds.colors.primary,
    ds.colors.secondary,
    ds.colors.accent
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${index * 55}ms` }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-background text-right shadow-sm duration-300 animate-in fade-in slide-in-from-bottom-3 hover:-translate-y-1 hover:border-border hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.13)]"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-muted/40">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
          <div
            className="origin-top-left"
            style={{ transform: 'scale(0.5)', width: '200%' }}
          >
            <TemplatePreview preset={preset} />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/[0.52] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-zinc-900 shadow-sm">
            <Eye className="h-3.5 w-3.5" />
            پیش‌نمایش کامل
          </span>
        </div>

        {isActive && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            فعال
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-3.5">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-foreground">
              {preset.name}
            </span>
            {ds.tagline && (
              <span
                className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: `${ds.colors.primary}1a`,
                  color: ds.colors.primary
                }}
              >
                {ds.tagline}
              </span>
            )}
          </div>
          <div className="flex flex-shrink-0 gap-1">
            {swatches.map((c, i) => (
              <span
                key={i}
                className="h-3 w-3 flex-shrink-0 rounded-[3px] border border-black/[0.09]"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        {preset.description && (
          <p className="m-0 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {preset.description}
          </p>
        )}
      </div>
    </button>
  );
}
