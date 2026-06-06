'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Eye,
  LayoutTemplate,
  Monitor,
  Smartphone,
  Tablet,
  Tv2,
  Save,
  Palette,
  Settings2,
  RotateCcw,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useUserStore } from '@/lib/store';
import type { TemplatePreset, UIBlockConfig, UITemplate } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { BlockEditor } from '@/components/ui-template/block-editor';
import { EduspherePreviewFrame } from '@/components/ui-template/edusphere-preview-frame';
import { useUiTemplatePreview } from '@/hooks/use-ui-template-preview';
import {
  buildThemeDraftPayload,
  buildThemeDraftFromPrimary
} from '@/lib/ui-template/theme-draft-payload';
import { BlocksList } from '@/components/ui-template/blocks-list';
import { TemplateSelectModal } from '@/components/ui-template/template-select-modal';
import { SectionLibraryModal } from '@/components/ui-template/section-library-modal';
import { DESIGN_SYSTEMS } from '@/lib/design-systems';
import {
  derivePaletteFromPrimary,
  paletteToThemeColors
} from '@/lib/design-system-palette';
import {
  applyThemeVariables,
  dispatchThemeUpdate,
  parseThemeResponse,
  DEFAULT_THEME_CONFIG
} from '@/lib/theme';

type DeviceMode = 'widescreen' | 'desktop' | 'tablet' | 'mobile';
type LeftTab = 'colors' | 'style' | 'block';

interface ThemeColors {
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
}

interface ThemeStyle {
  borderRadius: 'rounded' | 'soft' | 'sharp';
  shadow: 'none' | 'subtle' | 'medium' | 'strong';
  backgroundSvgPattern: string;
}

const DEFAULT_COLORS: ThemeColors = {
  primaryLight: DEFAULT_THEME_CONFIG.primary_color,
  primaryDark: DEFAULT_THEME_CONFIG.primary_color,
  secondaryLight: DEFAULT_THEME_CONFIG.secondary_color,
  secondaryDark: DEFAULT_THEME_CONFIG.secondary_color,
  accent: DEFAULT_THEME_CONFIG.accent_color,
  backgroundLight: DEFAULT_THEME_CONFIG.background_color,
  backgroundDark: '#0f172a'
};

const DEFAULT_THEME_STYLE: ThemeStyle = {
  borderRadius: 'rounded',
  shadow: 'medium',
  backgroundSvgPattern: ''
};

const BORDER_RADIUS_OPTIONS = [
  {
    value: 'rounded' as const,
    labelKey: 'settings.borderRadiusRounded',
    px: '16px'
  },
  { value: 'soft' as const, labelKey: 'settings.borderRadiusSoft', px: '24px' },
  { value: 'sharp' as const, labelKey: 'settings.borderRadiusSharp', px: '4px' }
];

const SHADOW_OPTIONS = [
  { value: 'none' as const, labelKey: 'settings.shadowNone', css: 'none' },
  {
    value: 'subtle' as const,
    labelKey: 'settings.shadowSubtle',
    css: '0 1px 4px rgba(0,0,0,0.08)'
  },
  {
    value: 'medium' as const,
    labelKey: 'settings.shadowMedium',
    css: '0 4px 12px rgba(0,0,0,0.12)'
  },
  {
    value: 'strong' as const,
    labelKey: 'settings.shadowStrong',
    css: '0 10px 24px rgba(0,0,0,0.18)'
  }
];

const QUICK_PALETTES = [
  {
    key: 'settings.paletteCoolBlue',
    colors: ['#3b82f6', '#6366f1', '#0ea5e9', '#f0f9ff', '#0f172a']
  },
  {
    key: 'settings.paletteWarmSunset',
    colors: ['#f97316', '#f43f5e', '#fbbf24', '#fff7ed', '#1c0710']
  },
  {
    key: 'settings.paletteForest',
    colors: ['#16a34a', '#65a30d', '#f59e0b', '#f0fdf4', '#052e16']
  },
  {
    key: 'settings.palettePurpleHaze',
    colors: ['#8b5cf6', '#a855f7', '#ec4899', '#faf5ff', '#1e1b4b']
  },
  {
    key: 'settings.paletteOceanDeep',
    colors: ['#0891b2', '#0284c7', '#06b6d4', '#ecfeff', '#0c1a2e']
  },
  {
    key: 'settings.paletteMinimalDark',
    colors: ['#0f172a', '#1e293b', '#94a3b8', '#f8fafc', '#0f172a']
  }
];

// Built-in color presets (independent of template layout presets)
const THEME_COLOR_PRESETS = [
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    primaryLight: '#0ea5e9',
    primaryDark: '#38bdf8',
    secondaryLight: '#6366f1',
    secondaryDark: '#818cf8',
    accent: '#06b6d4',
    backgroundLight: '#f0f9ff',
    backgroundDark: '#0c1a2e',
    borderRadius: 'rounded' as const,
    shadow: 'medium' as const
  },
  {
    id: 'sunset-luxe',
    name: 'Sunset Luxe',
    primaryLight: '#f97316',
    primaryDark: '#fb923c',
    secondaryLight: '#a855f7',
    secondaryDark: '#c084fc',
    accent: '#fbbf24',
    backgroundLight: '#fffbf7',
    backgroundDark: '#1a0a2e',
    borderRadius: 'sharp' as const,
    shadow: 'strong' as const
  },
  {
    id: 'forest-natural',
    name: 'Forest',
    primaryLight: '#16a34a',
    primaryDark: '#4ade80',
    secondaryLight: '#65a30d',
    secondaryDark: '#a3e635',
    accent: '#f59e0b',
    backgroundLight: '#f0fdf4',
    backgroundDark: '#052e16',
    borderRadius: 'soft' as const,
    shadow: 'subtle' as const
  },
  {
    id: 'midnight-pro',
    name: 'Midnight Pro',
    primaryLight: '#8b5cf6',
    primaryDark: '#a78bfa',
    secondaryLight: '#6366f1',
    secondaryDark: '#818cf8',
    accent: '#ec4899',
    backgroundLight: '#1e1b4b',
    backgroundDark: '#0a0a1a',
    borderRadius: 'rounded' as const,
    shadow: 'strong' as const
  },
  {
    id: 'coral-pop',
    name: 'Coral Pop',
    primaryLight: '#f43f5e',
    primaryDark: '#fb7185',
    secondaryLight: '#f97316',
    secondaryDark: '#fb923c',
    accent: '#fbbf24',
    backgroundLight: '#fff1f2',
    backgroundDark: '#1c0710',
    borderRadius: 'soft' as const,
    shadow: 'medium' as const
  },
  {
    id: 'arctic-white',
    name: 'Arctic',
    primaryLight: '#3b82f6',
    primaryDark: '#60a5fa',
    secondaryLight: '#64748b',
    secondaryDark: '#94a3b8',
    accent: '#0ea5e9',
    backgroundLight: '#f8fafc',
    backgroundDark: '#0f172a',
    borderRadius: 'rounded' as const,
    shadow: 'medium' as const
  }
];

function parseThemeStyle(raw: unknown): ThemeStyle {
  const data = (raw as Record<string, unknown>)?.data ?? raw ?? {};
  const configs = ((data as Record<string, unknown>)?.configs ??
    data) as Record<string, unknown>;
  return {
    borderRadius: (['rounded', 'soft', 'sharp'] as const).includes(
      configs?.border_radius_style as 'rounded' | 'soft' | 'sharp'
    )
      ? (configs.border_radius_style as ThemeStyle['borderRadius'])
      : DEFAULT_THEME_STYLE.borderRadius,
    shadow: (['none', 'subtle', 'medium', 'strong'] as const).includes(
      configs?.shadow_style as 'none' | 'subtle' | 'medium' | 'strong'
    )
      ? (configs.shadow_style as ThemeStyle['shadow'])
      : DEFAULT_THEME_STYLE.shadow,
    backgroundSvgPattern:
      typeof configs?.background_svg_pattern === 'string'
        ? configs.background_svg_pattern
        : DEFAULT_THEME_STYLE.backgroundSvgPattern
  };
}

function parseThemeColors(raw: unknown): ThemeColors {
  const data = (raw as Record<string, unknown>)?.data ?? raw ?? {};
  const configs = ((data as Record<string, unknown>)?.configs ??
    data) as Record<string, unknown>;
  const parsed = parseThemeResponse(raw);
  return {
    primaryLight:
      (configs?.primary_color_light as string) || parsed.primary_color,
    primaryDark:
      (configs?.primary_color_dark as string) || parsed.primary_color,
    secondaryLight:
      (configs?.secondary_color_light as string) ||
      parsed.secondary_color ||
      DEFAULT_COLORS.secondaryLight,
    secondaryDark:
      (configs?.secondary_color_dark as string) ||
      parsed.secondary_color ||
      DEFAULT_COLORS.secondaryDark,
    accent: parsed.accent_color || DEFAULT_COLORS.accent,
    backgroundLight:
      (configs?.background_color_light as string) ||
      parsed.background_color ||
      DEFAULT_COLORS.backgroundLight,
    backgroundDark:
      (configs?.background_color_dark as string) ||
      DEFAULT_COLORS.backgroundDark
  };
}

export default function UITemplateSettingsPage() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const storeSlug = user?.currentAcademy?.slug ?? '';

  const [template, setTemplate] = useState<UITemplate | null>(null);
  const [presets, setPresets] = useState<TemplatePreset[]>([]);
  const [blocks, setBlocks] = useState<UIBlockConfig[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSectionLibrary, setShowSectionLibrary] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [leftTab, setLeftTab] = useState<LeftTab>('colors');
  const [themeColors, setThemeColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>(DEFAULT_THEME_STYLE);
  const [copied, setCopied] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const hasTemplate = !!template?.id;

  const buildThemePayloadFromState = useCallback(
    () => buildThemeDraftPayload(themeColors, themeStyle),
    [themeColors, themeStyle]
  );

  const {
    iframeSrc,
    siteUrl: previewSiteUrl,
    isPreviewSyncing,
    isPreviewLoading,
    isPreviewReady,
    persistDraft,
    bumpPreview,
    openFullPreview
  } = useUiTemplatePreview({
    storeSlug,
    blocks,
    hasTemplate,
    isActive,
    isDirty,
    setIsDirty,
    buildThemePayload: buildThemePayloadFromState,
    onDraftSaved: () => setHasUnpublishedChanges(true)
  });

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  );

  const activeBlock = useMemo(
    () => blocks.find((b) => b.id === activeBlockId) ?? null,
    [blocks, activeBlockId]
  );

  const activePresetId = template?.template_preset ?? '';

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [templateData, presetsData, themeData] = await Promise.all([
        apiClient.getCurrentUITemplate().catch(() => null),
        apiClient.getAvailableTemplatePresets().catch(() => []),
        apiClient.getCurrentThemeConfig().catch(() => null)
      ]);

      setTemplate(templateData as UITemplate | null);
      setPresets(presetsData as TemplatePreset[]);
      setBlocks((templateData as UITemplate | null)?.blocks ?? []);
      setIsActive((templateData as UITemplate | null)?.is_active ?? true);
      setHasUnpublishedChanges(
        Boolean((templateData as UITemplate | null)?.has_unpublished_changes) ||
          Boolean(
            (themeData as { has_unpublished_changes?: boolean } | null)
              ?.has_unpublished_changes
          )
      );

      if (themeData) {
        setThemeColors(parseThemeColors(themeData));
        setThemeStyle(parseThemeStyle(themeData));
      }

      const td = templateData as UITemplate | null;
      const hasNoContent = !td?.id || (td.blocks ?? []).length === 0;
      if (hasNoContent) {
        setShowTemplateModal(true);
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const markDirty = useCallback(() => setIsDirty(true), []);

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVisibility = (blockId: string, checked: boolean) => {
    markDirty();
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, isVisible: checked } : b))
    );
  };

  const handleUpdateBlockConfig = (
    blockId: string,
    config: Record<string, unknown>
  ) => {
    markDirty();
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, config } : b))
    );
  };

  const handleUpdateBlockType = (
    blockId: string,
    type: UIBlockConfig['type']
  ) => {
    markDirty();
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, type } : b))
    );
  };

  const handleMoveUp = (blockId: string) => {
    markDirty();
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === blockId);
    if (idx <= 0) return;
    const updated = sorted.map((b, i) => {
      if (i === idx) return { ...b, order: sorted[idx - 1].order };
      if (i === idx - 1) return { ...b, order: sorted[idx].order };
      return b;
    });
    setBlocks(updated);
  };

  const handleMoveDown = (blockId: string) => {
    markDirty();
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === blockId);
    if (idx >= sorted.length - 1) return;
    const updated = sorted.map((b, i) => {
      if (i === idx) return { ...b, order: sorted[idx + 1].order };
      if (i === idx + 1) return { ...b, order: sorted[idx].order };
      return b;
    });
    setBlocks(updated);
  };

  const handleRemoveBlock = (blockId: string) => {
    markDirty();
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  };

  const handleSectionImported = async () => {
    setHasUnpublishedChanges(true);
    bumpPreview();
    await loadData();
  };

  const applyDerivedPrimary = useCallback(
    (primaryHex: string, styleOverride?: Partial<ThemeStyle>) => {
      const style = { ...themeStyle, ...styleOverride };
      const derived = paletteToThemeColors(
        derivePaletteFromPrimary(primaryHex)
      );
      setThemeColors(derived);
      const payload = buildThemeDraftFromPrimary(primaryHex, style);
      applyThemeVariables(payload);
      dispatchThemeUpdate(payload);
    },
    [themeStyle]
  );

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      await persistDraft(false);
      bumpPreview();
      setIsDirty(false);
      ErrorHandler.showSuccess(t('settings.uiTemplateDraftSavedSuccess'));
      await loadData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await persistDraft(true);
      await apiClient.publishSite();
      setHasUnpublishedChanges(false);
      bumpPreview();
      setIsDirty(false);
      ErrorHandler.showSuccess(t('settings.uiTemplatePublishedSuccess'));
      await loadData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenPreview = async () => {
    try {
      await openFullPreview();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      setIsApplyingPreset(true);
      await apiClient.applyTemplatePreset(presetId);

      const ds = DESIGN_SYSTEMS[presetId];
      if (ds) {
        setThemeStyle((prev) => ({
          ...prev,
          borderRadius: ds.shape.borderRadius,
          shadow: ds.shape.shadow
        }));
        applyDerivedPrimary(ds.colors.primary, {
          borderRadius: ds.shape.borderRadius,
          shadow: ds.shape.shadow
        });
        await apiClient.saveThemeDraft(
          buildThemeDraftFromPrimary(ds.colors.primary, {
            borderRadius: ds.shape.borderRadius,
            shadow: ds.shape.shadow,
            backgroundSvgPattern: themeStyle.backgroundSvgPattern
          })
        );
      }

      setHasUnpublishedChanges(true);
      bumpPreview();
      setIsDirty(false);
      ErrorHandler.showSuccess(t('settings.uiTemplateSavedSuccess'));
      await loadData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsApplyingPreset(false);
    }
  };

  const handleApplyColorPreset = useCallback(
    (preset: (typeof THEME_COLOR_PRESETS)[number]) => {
      markDirty();
      setThemeStyle((prev) => ({
        ...prev,
        borderRadius: preset.borderRadius,
        shadow: preset.shadow
      }));
      applyDerivedPrimary(preset.primaryLight, {
        borderRadius: preset.borderRadius,
        shadow: preset.shadow
      });
    },
    [markDirty, applyDerivedPrimary]
  );

  const handlePrimaryColorChange = useCallback(
    (value: string) => {
      markDirty();
      applyDerivedPrimary(value);
    },
    [markDirty, applyDerivedPrimary]
  );

  const handleResetColors = useCallback(() => {
    markDirty();
    const ds = DESIGN_SYSTEMS[activePresetId];
    if (!ds) return;
    setThemeStyle((prev) => ({
      ...prev,
      borderRadius: ds.shape.borderRadius,
      shadow: ds.shape.shadow
    }));
    applyDerivedPrimary(ds.colors.primary, {
      borderRadius: ds.shape.borderRadius,
      shadow: ds.shape.shadow
    });
  }, [activePresetId, markDirty, applyDerivedPrimary]);

  const handleCopyConfig = useCallback(() => {
    navigator.clipboard.writeText(
      JSON.stringify(buildThemePayloadFromState(), null, 2)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [themeColors, themeStyle]);

  const handleSelectBlock = useCallback((id: string | null) => {
    setActiveBlockId(id);
    if (id) setLeftTab('block');
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[calc(100vh-8rem)]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b bg-background px-6 py-3">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight">
            {t('settings.uiTemplateBuilderTitle')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t('settings.uiTemplateBuilderSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Device switcher */}
          <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              title="Widescreen"
              onClick={() => setDeviceMode('widescreen')}
              className={`rounded p-1.5 transition-colors ${deviceMode === 'widescreen' ? 'bg-background shadow-sm' : 'hover:bg-accent'}`}
            >
              <Tv2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Desktop"
              onClick={() => setDeviceMode('desktop')}
              className={`rounded p-1.5 transition-colors ${deviceMode === 'desktop' ? 'bg-background shadow-sm' : 'hover:bg-accent'}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Tablet"
              onClick={() => setDeviceMode('tablet')}
              className={`rounded p-1.5 transition-colors ${deviceMode === 'tablet' ? 'bg-background shadow-sm' : 'hover:bg-accent'}`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Mobile"
              onClick={() => setDeviceMode('mobile')}
              className={`rounded p-1.5 transition-colors ${deviceMode === 'mobile' ? 'bg-background shadow-sm' : 'hover:bg-accent'}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyConfig}
          >
            {copied ? (
              <Check className="mr-1.5 h-4 w-4 text-green-500" />
            ) : (
              <Copy className="mr-1.5 h-4 w-4" />
            )}
            {t('settings.copyConfig')}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateModal(true)}
          >
            <LayoutTemplate className="mr-1.5 h-4 w-4" />
            {t('settings.changeTemplate')}
          </Button>

          {hasUnpublishedChanges && (
            <Badge variant="outline" className="text-xs text-amber-600">
              {t('settings.unpublishedChanges')}
            </Badge>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isPreviewReady}
            onClick={handleOpenPreview}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            {t('settings.previewSite')}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? t('settings.saving') : t('settings.saveDraft')}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isPublishing
              ? t('settings.publishing')
              : t('settings.publishSite')}
          </Button>
        </div>
      </div>

      {/* 3-panel body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="flex w-64 flex-shrink-0 flex-col overflow-hidden border-r bg-background">
          {/* Active preset badge */}
          <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
            {activePresetId ? (
              <>
                <span className="text-xs text-muted-foreground">
                  {t('settings.basedOn')}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {activePresetId}
                </Badge>
              </>
            ) : template?.id ? (
              <Badge
                variant="outline"
                className="border-green-300 text-xs text-green-600"
              >
                {t('settings.customDesignSystem')}
              </Badge>
            ) : null}
          </div>

          {/* Template active toggle */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-xs font-medium">
                {t('settings.templateStatus')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.templateStatusDescription')}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => {
                markDirty();
                setIsActive(checked);
              }}
            />
          </div>

          {/* Tab strip */}
          <div className="flex flex-shrink-0 border-b">
            {(
              [
                { id: 'colors', labelKey: 'settings.tabColors', Icon: Palette },
                { id: 'style', labelKey: 'settings.tabStyle', Icon: Layers },
                { id: 'block', labelKey: 'settings.tabBlock', Icon: Settings2 }
              ] as const
            ).map(({ id, labelKey, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setLeftTab(id)}
                className={`flex flex-1 items-center justify-center gap-1 border-b-2 py-2 text-[10px] font-medium transition-colors ${
                  leftTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                {t(labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {/* ── Colors tab ─────────────────────────────── */}
            {leftTab === 'colors' && (
              <div className="space-y-4 p-4">
                {/* Built-in color presets */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('settings.colorPresetsLabel')}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {THEME_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        title={preset.name}
                        onClick={() => handleApplyColorPreset(preset)}
                        className="group flex flex-col overflow-hidden rounded-md border transition-all hover:border-primary hover:shadow-sm"
                      >
                        <div
                          className="h-5 w-full"
                          style={{
                            background: `linear-gradient(135deg, ${preset.primaryLight}, ${preset.secondaryLight})`
                          }}
                        />
                        <span className="truncate px-1 py-0.5 text-[8px] text-muted-foreground group-hover:text-foreground">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <Separator />

                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('settings.brandColorLabel')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('settings.brandColorHelper')}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border shadow-sm">
                      <input
                        type="color"
                        title={t('settings.colorPrimaryLabel')}
                        value={themeColors.primaryLight}
                        onChange={(e) =>
                          handlePrimaryColorChange(e.target.value)
                        }
                        className="absolute -inset-1 h-14 w-14 cursor-pointer border-0 p-0"
                      />
                    </div>
                    <Input
                      value={themeColors.primaryLight}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="h-8 font-mono text-xs"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('settings.derivedPaletteLabel')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        labelKey: 'settings.colorSecondaryLabel',
                        color: themeColors.secondaryLight
                      },
                      {
                        labelKey: 'settings.accentColorLabel',
                        color: themeColors.accent
                      },
                      {
                        labelKey: 'settings.colorBackgroundLabel',
                        color: themeColors.backgroundLight
                      },
                      {
                        labelKey: 'settings.nightMode',
                        color: themeColors.backgroundDark
                      }
                    ].map(({ labelKey, color }) => (
                      <div
                        key={labelKey}
                        className="flex items-center gap-2 rounded-md border px-2 py-1.5"
                      >
                        <div
                          className="h-5 w-5 shrink-0 rounded border shadow-sm"
                          style={{ background: color }}
                        />
                        <span className="truncate text-[10px] text-muted-foreground">
                          {t(labelKey as Parameters<typeof t>[0])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Quick palettes */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('settings.quickPalettesLabel')}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_PALETTES.map((palette) => (
                      <button
                        key={palette.key}
                        type="button"
                        onClick={() => {
                          markDirty();
                          applyDerivedPrimary(palette.colors[0]);
                        }}
                        className="flex flex-col gap-1 rounded border p-1.5 text-left transition-all hover:border-primary hover:shadow-sm"
                      >
                        <div className="flex gap-0.5">
                          <div
                            className="h-3.5 w-3.5 rounded-full border border-white/50 shadow-sm"
                            style={{ background: palette.colors[0] }}
                          />
                          <div
                            className="h-3.5 flex-1 rounded-full border border-white/50 shadow-sm"
                            style={{
                              background: `linear-gradient(90deg, ${derivePaletteFromPrimary(palette.colors[0]).secondaryLight}, ${derivePaletteFromPrimary(palette.colors[0]).accent})`
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-medium text-muted-foreground">
                          {t(palette.key as Parameters<typeof t>[0])}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {activePresetId && DESIGN_SYSTEMS[activePresetId] && (
                  <button
                    type="button"
                    onClick={handleResetColors}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t('settings.resetToTemplateColors')}
                  </button>
                )}
              </div>
            )}

            {/* ── Style tab ──────────────────────────────── */}
            {leftTab === 'style' && (
              <div className="space-y-5 p-4">
                {/* Border radius */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('settings.borderRadiusLabel')}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BORDER_RADIUS_OPTIONS.map(({ value, labelKey, px }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          markDirty();
                          setThemeStyle((s) => ({ ...s, borderRadius: value }));
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded border py-2 text-[10px] font-medium transition-colors ${
                          themeStyle.borderRadius === value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:bg-accent'
                        }`}
                      >
                        <div
                          className="h-6 w-8 border-2 border-current opacity-60"
                          style={{ borderRadius: px }}
                        />
                        {t(labelKey as Parameters<typeof t>[0])}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shadow */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('settings.shadowLabel')}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SHADOW_OPTIONS.map(({ value, labelKey, css }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          markDirty();
                          setThemeStyle((s) => ({ ...s, shadow: value }));
                        }}
                        className={`flex flex-col items-center gap-2 rounded border py-2 text-[10px] font-medium transition-colors ${
                          themeStyle.shadow === value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:bg-accent'
                        }`}
                      >
                        <div
                          className="h-6 w-10 rounded-md bg-background"
                          style={{ boxShadow: css }}
                        />
                        {t(labelKey as Parameters<typeof t>[0])}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* SVG pattern */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('settings.svgPattern')}
                  </p>
                  <Input
                    value={themeStyle.backgroundSvgPattern}
                    onChange={(e) => {
                      markDirty();
                      setThemeStyle((s) => ({
                        ...s,
                        backgroundSvgPattern: e.target.value
                      }));
                    }}
                    placeholder="dots, grid, waves..."
                    className="h-7 font-mono text-[10px]"
                  />
                  <p className="text-[9px] text-muted-foreground">
                    {t('settings.svgPatternHelper')}
                  </p>
                </div>
              </div>
            )}

            {/* ── Block tab ──────────────────────────────── */}
            {leftTab === 'block' && (
              <BlockEditor
                block={activeBlock}
                onUpdate={handleUpdateBlockConfig}
                onTypeChange={handleUpdateBlockType}
              />
            )}
          </div>
        </aside>

        {/* Center panel — Live Edusphere preview via API draft data */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/20 p-4">
          <EduspherePreviewFrame
            iframeSrc={iframeSrc}
            siteUrl={previewSiteUrl}
            deviceMode={deviceMode}
            isLoading={isPreviewSyncing}
            isInitializing={isPreviewLoading}
            isReady={isPreviewReady}
            emptyMessage={t('settings.noBlocksMessage')}
          />
        </main>

        {/* Right panel — Blocks list */}
        <aside className="flex w-60 flex-shrink-0 flex-col overflow-hidden border-l bg-background">
          <BlocksList
            blocks={sortedBlocks}
            activeBlockId={activeBlockId}
            onSelectBlock={handleSelectBlock}
            onToggleVisibility={handleToggleVisibility}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onAddSection={() => setShowSectionLibrary(true)}
            onRemoveBlock={handleRemoveBlock}
          />
        </aside>
      </div>

      <TemplateSelectModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        presets={presets}
        activePresetId={activePresetId}
        onApply={handleApplyPreset}
        isApplying={isApplyingPreset}
      />

      <SectionLibraryModal
        open={showSectionLibrary}
        onClose={() => setShowSectionLibrary(false)}
        onImported={handleSectionImported}
      />
    </div>
  );
}
