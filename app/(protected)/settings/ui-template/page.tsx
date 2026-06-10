'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  X,
  Check,
  Loader2,
  Wand2,
  LayoutTemplate,
  Pencil,
  Eye,
  Lock,
  Trash2
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
import { SectionCustomizationPanel } from '@/components/ui-template/section-customization-panel';
import { SectionLibraryModal } from '@/components/ui-template/section-library-modal';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

// Card/preview swatches follow the template's saved theme when present, so a
// dedicated template shows its real palette instead of the design-system default.
function resolveTemplateColors(preset: TemplatePreset) {
  const ds = getDesignSystem(preset.id);
  const t = preset.theme ?? null;
  const pick = (key: string, fallback: string) =>
    t && typeof t[key] === 'string' && t[key] ? t[key] : fallback;
  return {
    background: pick('background_color', ds.colors.background),
    primary: pick('primary_color', ds.colors.primary),
    secondary: pick('secondary_color', ds.colors.secondary),
    accent: pick('accent_color', ds.colors.accent)
  };
}

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
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  // Cover image for a dedicated template; seeded from the source template so it
  // inherits a meaningful image until the manager replaces it.
  const [coverImage, setCoverImage] = useState<string | null>(null);

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
    setSelectedBlockId(null);
    setCoverImage(preset.preview ?? null);
    setIsPreviewLoading(true);

    // Base presets seed their palette from the design system; dedicated
    // templates carry their own saved theme, restored server-side on apply.
    const isDedicated = preset.visibility === 'DEDICATED';
    const ds = getDesignSystem(preset.id);
    if (!isDedicated) {
      setPrimaryColor(ds.colors.primary);
      setBorderRadius(ds.shape.borderRadius);
      setShadow(ds.shape.shadow);
      setDarkMode(ds.darkMode);
    }
    setDraftBlocks(preset.blocks);

    try {
      await apiClient.applyTemplatePreset(preset.id);

      // Seeding the draft theme only applies to base presets — doing it for a
      // dedicated template would overwrite its restored palette with defaults.
      if (!isDedicated) {
        const { name: _omitName, ...themeSeed } = buildThemePayload(ds);
        await apiClient.saveThemeDraft(themeSeed);
      }

      const [session, themeRaw] = await Promise.all([
        apiClient.getTemplatePreviewSession(),
        apiClient.getCurrentThemeConfig().catch(() => null)
      ]);

      const cfg = ((themeRaw as Record<string, any> | null)?.data?.configs ??
        (themeRaw as Record<string, any> | null)?.configs ??
        {}) as Record<string, string | boolean | null>;

      // Hydrate the sidebar from a dedicated template's restored palette.
      if (isDedicated) {
        if (cfg.primary_color) setPrimaryColor(cfg.primary_color as string);
        if (cfg.border_radius_style)
          setBorderRadius(cfg.border_radius_style as BorderRadius);
        if (cfg.shadow_style) setShadow(cfg.shadow_style as Shadow);
        setDarkMode(
          cfg.dark_mode === 'true' || cfg.dark_mode === true
            ? true
            : cfg.dark_mode === 'false' || cfg.dark_mode === false
              ? false
              : null
        );
      }

      // Design-size tokens are not part of a preset palette and survive a switch.
      if (cfg.section_spacing)
        setSectionSpacing(cfg.section_spacing as SectionSpacing);
      if (cfg.container_width)
        setContainerWidth(cfg.container_width as ContainerWidth);
      if (cfg.heading_scale) setHeadingScale(cfg.heading_scale as HeadingScale);

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
    setSelectedBlockId(null);
  };

  const refreshPresets = useCallback(async () => {
    const data = await apiClient.getAvailableTemplatePresets().catch(() => []);
    setPresets(data as TemplatePreset[]);
  }, []);

  const handleDeleteTemplate = async (preset: TemplatePreset) => {
    if (!window.confirm(`حذف قالب اختصاصی "${preset.name}"؟`)) return;
    try {
      await apiClient.deleteDedicatedTemplate(preset.id);
      await refreshPresets();
      ErrorHandler.showSuccess('قالب اختصاصی حذف شد');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const handleSaveAsTemplate = async () => {
    // Updating your own template keeps its name; only a brand-new one asks for it.
    const editingOwn =
      selectedPreset?.isOwned && selectedPreset?.visibility === 'DEDICATED';
    const name = editingOwn
      ? selectedPreset!.name
      : window.prompt('نام قالب اختصاصی را وارد کنید')?.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      // Flush pending style changes with a targeted save — do NOT rebuild the
      // full palette from primary here. buildThemeDraftFromPrimary would
      // overwrite the template's curated design-system colors with
      // algorithm-derived ones, causing unintentional color drift on every save.
      await apiClient.saveThemeDraft({
        border_radius_style: borderRadius,
        shadow_style: shadow,
        dark_mode: darkMode
      });
      await apiClient.saveUITemplateDraft({ blocks: draftBlocks });
      const saved = (await apiClient.saveDraftAsTemplate({
        name,
        preview: coverImage ?? undefined
      })) as TemplatePreset | null;
      // Sync the active template so subsequent saves update it instead of forking.
      if (saved) {
        setSelectedPreset(saved);
        setCoverImage(saved.preview ?? null);
      }
      await refreshPresets();
      ErrorHandler.showSuccess(
        editingOwn
          ? `قالب "${name}" به‌روزرسانی شد`
          : `قالب اختصاصی "${name}" ذخیره شد`
      );
      handleClosePreview();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
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

  // ── Per-section panel handlers ──────────────────────────────────────────────

  const handleBlockConfigChange = (
    blockId: string,
    config: Record<string, unknown>
  ) => {
    const updated = draftBlocks.map((b) =>
      b.id === blockId ? { ...b, config } : b
    );
    setDraftBlocks(updated);
    debouncedSaveBlocks(updated);
  };

  // Header stays pinned first and footer last; only the middle stack reorders.
  const handleBlockMove = (blockId: string, dir: 'up' | 'down') => {
    const sorted = [...draftBlocks].sort((a, b) => a.order - b.order);
    const header = sorted.find((b) => b.type === 'header');
    const footer = sorted.find((b) => b.type === 'footer');
    const middle = sorted.filter(
      (b) => b.type !== 'header' && b.type !== 'footer'
    );
    const i = middle.findIndex((b) => b.id === blockId);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= middle.length) return;
    [middle[i], middle[j]] = [middle[j], middle[i]];
    const next = [
      ...(header ? [header] : []),
      ...middle,
      ...(footer ? [footer] : [])
    ].map((block, index) => ({ ...block, order: index + 1 }));
    handleBlocksChange(next);
  };

  const handleBlockDelete = (blockId: string) => {
    const block = draftBlocks.find((b) => b.id === blockId);
    if (!block || block.type === 'header' || block.type === 'footer') return;
    const next = draftBlocks
      .filter((b) => b.id !== blockId)
      .sort((a, b) => a.order - b.order)
      .map((b, index) => ({ ...b, order: index + 1 }));
    setSelectedBlockId(null);
    handleBlocksChange(next);
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
    const colors = resolveTemplateColors(selectedPreset);

    const selectedBlock =
      draftBlocks.find((b) => b.id === selectedBlockId) ?? null;
    const middleBlocks = [...draftBlocks]
      .sort((a, b) => a.order - b.order)
      .filter((b) => b.type !== 'header' && b.type !== 'footer');
    const midIndex = selectedBlock
      ? middleBlocks.findIndex((b) => b.id === selectedBlock.id)
      : -1;

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

          <div className="flex items-center gap-1.5">
            {[colors.primary, colors.secondary, colors.accent].map((c, i) => (
              <span
                key={i}
                className="h-4 w-4 rounded-full border-2 border-zinc-700 shadow-sm"
                style={{ background: c }}
              />
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            {ds.tagline && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                style={{ background: colors.primary }}
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
              onSaveAsTemplate={handleSaveAsTemplate}
              onClose={() => setShowCustomizer(false)}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              coverImage={coverImage}
              onCoverImageChange={setCoverImage}
            />
          )}

          {selectedBlock && (
            <SectionCustomizationPanel
              block={selectedBlock}
              canMoveUp={midIndex > 0}
              canMoveDown={midIndex >= 0 && midIndex < middleBlocks.length - 1}
              canDelete={
                selectedBlock.type !== 'header' &&
                selectedBlock.type !== 'footer'
              }
              onUpdate={handleBlockConfigChange}
              onMove={handleBlockMove}
              onDelete={handleBlockDelete}
              onClose={() => setSelectedBlockId(null)}
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
              onDelete={
                preset.isOwned ? () => handleDeleteTemplate(preset) : undefined
              }
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
  onDelete?: () => void;
}

function GalleryCard({
  preset,
  isActive,
  index,
  onClick,
  onDelete
}: GalleryCardProps) {
  const ds = getDesignSystem(preset.id);
  const isDedicated = preset.visibility === 'DEDICATED';
  const colors = resolveTemplateColors(preset);
  const swatches = [
    colors.background,
    colors.primary,
    colors.secondary,
    colors.accent
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${index * 55}ms` }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-background text-right shadow-sm duration-300 animate-in fade-in slide-in-from-bottom-3 hover:-translate-y-1 hover:border-border hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.13)]"
    >
      {/* Dedicated badge + owner delete */}
      <div className="absolute left-2.5 top-2.5 z-20 flex items-center gap-1.5">
        {isDedicated && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <Lock className="h-2.5 w-2.5" />
            اختصاصی
          </span>
        )}
        {onDelete && (
          <span
            role="button"
            tabIndex={0}
            title="حذف قالب اختصاصی"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="inline-flex items-center justify-center rounded-full bg-white/90 p-1 text-red-600 shadow-sm transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Thumbnail — static cover image at the locked 16/9 cover ratio */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/40">
        {preset.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preset.preview}
            alt={preset.name}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div
              className="origin-top-left"
              style={{ transform: 'scale(0.5)', width: '200%' }}
            >
              <TemplatePreview preset={preset} />
            </div>
          </div>
        )}

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
            {!isDedicated && ds.tagline && (
              <span
                className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: `${colors.primary}1a`,
                  color: colors.primary
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
