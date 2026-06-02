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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useUserStore } from '@/lib/store';
import type { TemplatePreset, UIBlockConfig, UITemplate } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { BlockEditor } from '@/components/ui-template/block-editor';
import {
  SitePreview,
  type PreviewTheme
} from '@/components/ui-template/site-preview';
import { BlocksList } from '@/components/ui-template/blocks-list';
import { TemplateSelectModal } from '@/components/ui-template/template-select-modal';
import { DESIGN_SYSTEMS, buildThemePayload } from '@/lib/design-systems';
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
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [leftTab, setLeftTab] = useState<LeftTab>('colors');
  const [themeColors, setThemeColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>(DEFAULT_THEME_STYLE);
  const [copied, setCopied] = useState(false);

  const hasTemplate = !!template?.id;

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  );

  const activeBlock = useMemo(
    () => blocks.find((b) => b.id === activeBlockId) ?? null,
    [blocks, activeBlockId]
  );

  const activePresetId = template?.template_preset ?? '';

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL
    ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/s/${storeSlug}`
    : storeSlug
      ? `/s/${storeSlug}`
      : undefined;

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

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVisibility = (blockId: string, checked: boolean) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, isVisible: checked } : b))
    );
  };

  const handleUpdateBlockConfig = (
    blockId: string,
    config: Record<string, unknown>
  ) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, config } : b))
    );
  };

  const handleUpdateBlockType = (
    blockId: string,
    type: UIBlockConfig['type']
  ) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, type } : b))
    );
  };

  const handleMoveUp = (blockId: string) => {
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

  const buildThemePayloadFromState = () => ({
    primary_color: themeColors.primaryLight,
    primary_color_light: themeColors.primaryLight,
    primary_color_dark: themeColors.primaryDark,
    secondary_color: themeColors.secondaryLight,
    secondary_color_light: themeColors.secondaryLight,
    secondary_color_dark: themeColors.secondaryDark,
    accent_color: themeColors.accent,
    background_color: themeColors.backgroundLight,
    background_color_light: themeColors.backgroundLight,
    background_color_dark: themeColors.backgroundDark,
    dark_mode: null,
    border_radius_style: themeStyle.borderRadius,
    shadow_style: themeStyle.shadow,
    background_svg_pattern: themeStyle.backgroundSvgPattern
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Sending null explicitly breaks the link to the base template preset.
      // After save, the stored blocks + theme are the academy's own design system.
      const templatePayload = {
        blocks,
        template_preset: null,
        is_active: isActive
      };
      const colorPayload = buildThemePayloadFromState();

      await Promise.all([
        hasTemplate
          ? apiClient.updateUITemplate(templatePayload)
          : apiClient.createUITemplate({ blocks, is_active: isActive }),
        apiClient.updateCurrentThemeConfig(colorPayload)
      ]);

      applyThemeVariables(colorPayload);
      dispatchThemeUpdate(colorPayload);
      ErrorHandler.showSuccess(t('settings.uiTemplateSavedSuccess'));
      await loadData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      setIsApplyingPreset(true);
      await apiClient.applyTemplatePreset(presetId);

      const ds = DESIGN_SYSTEMS[presetId];
      if (ds) {
        const themePayload = buildThemePayload(ds);
        await apiClient.updateCurrentThemeConfig(themePayload);
        applyThemeVariables(themePayload);
        dispatchThemeUpdate(themePayload);
        setThemeColors((prev) => ({
          ...prev,
          primaryLight: ds.colors.primary,
          primaryDark: ds.colors.primary,
          secondaryLight: ds.colors.secondary,
          secondaryDark: ds.colors.secondary,
          accent: ds.colors.accent,
          backgroundLight: ds.colors.background,
          backgroundDark: ds.colors.backgroundDark
        }));
        setThemeStyle((prev) => ({
          ...prev,
          borderRadius: ds.shape.borderRadius,
          shadow: ds.shape.shadow
        }));
      }

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
      const colors: ThemeColors = {
        primaryLight: preset.primaryLight,
        primaryDark: preset.primaryDark,
        secondaryLight: preset.secondaryLight,
        secondaryDark: preset.secondaryDark,
        accent: preset.accent,
        backgroundLight: preset.backgroundLight,
        backgroundDark: preset.backgroundDark
      };
      setThemeColors(colors);
      setThemeStyle((prev) => ({
        ...prev,
        borderRadius: preset.borderRadius,
        shadow: preset.shadow
      }));
      const payload = {
        primary_color: colors.primaryLight,
        secondary_color: colors.secondaryLight,
        accent_color: colors.accent,
        background_color: colors.backgroundLight,
        dark_mode: null
      };
      applyThemeVariables(payload);
      dispatchThemeUpdate(payload);
    },
    []
  );

  const handleColorChange = useCallback(
    (key: keyof ThemeColors, value: string) => {
      setThemeColors((prev) => {
        const updated = { ...prev, [key]: value };
        if (key === 'primaryLight') {
          const payload = {
            primary_color: updated.primaryLight,
            secondary_color: updated.secondaryLight,
            accent_color: updated.accent,
            background_color: updated.backgroundLight,
            dark_mode: null
          };
          applyThemeVariables(payload);
          dispatchThemeUpdate(payload);
        }
        return updated;
      });
    },
    []
  );

  const handleResetColors = useCallback(() => {
    const ds = DESIGN_SYSTEMS[activePresetId];
    if (!ds) return;
    const reset: ThemeColors = {
      primaryLight: ds.colors.primary,
      primaryDark: ds.colors.primary,
      secondaryLight: ds.colors.secondary,
      secondaryDark: ds.colors.secondary,
      accent: ds.colors.accent,
      backgroundLight: ds.colors.background,
      backgroundDark: ds.colors.backgroundDark
    };
    setThemeColors(reset);
    setThemeStyle((prev) => ({
      ...prev,
      borderRadius: ds.shape.borderRadius,
      shadow: ds.shape.shadow
    }));
    const payload = {
      primary_color: reset.primaryLight,
      secondary_color: reset.secondaryLight,
      accent_color: reset.accent,
      background_color: reset.backgroundLight,
      dark_mode: null
    };
    applyThemeVariables(payload);
    dispatchThemeUpdate(payload);
  }, [activePresetId]);

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

  const previewTheme: PreviewTheme = {
    primaryLight: themeColors.primaryLight,
    primaryDark: themeColors.primaryDark,
    secondaryLight: themeColors.secondaryLight,
    secondaryDark: themeColors.secondaryDark,
    accent: themeColors.accent,
    backgroundLight: themeColors.backgroundLight,
    backgroundDark: themeColors.backgroundDark,
    borderRadius: themeStyle.borderRadius,
    shadow: themeStyle.shadow
  };

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

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!storefrontUrl}
            onClick={() =>
              storefrontUrl && window.open(storefrontUrl, '_blank')
            }
          >
            <Eye className="mr-1.5 h-4 w-4" />
            {t('settings.previewSite')}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? t('settings.saving') : t('settings.publishSite')}
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
            <Switch checked={isActive} onCheckedChange={setIsActive} />
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

                {/* Color pairs */}
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('settings.customColorsLabel')}
                </p>

                {[
                  {
                    lightKey: 'primaryLight' as const,
                    darkKey: 'primaryDark' as const,
                    labelKey: 'settings.colorPrimaryLabel'
                  },
                  {
                    lightKey: 'secondaryLight' as const,
                    darkKey: 'secondaryDark' as const,
                    labelKey: 'settings.colorSecondaryLabel'
                  },
                  {
                    lightKey: 'backgroundLight' as const,
                    darkKey: 'backgroundDark' as const,
                    labelKey: 'settings.colorBackgroundLabel'
                  }
                ].map(({ lightKey, darkKey, labelKey }) => (
                  <div key={lightKey} className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">
                      {t(labelKey as Parameters<typeof t>[0])}
                    </Label>
                    {[
                      { key: lightKey, modeKey: 'settings.dayMode' },
                      { key: darkKey, modeKey: 'settings.nightMode' }
                    ].map(({ key, modeKey }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className="w-6 text-[9px] text-muted-foreground">
                          {t(modeKey as Parameters<typeof t>[0])}
                        </span>
                        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded border shadow-sm">
                          <input
                            type="color"
                            title={`${t(labelKey as Parameters<typeof t>[0])} ${t(modeKey as Parameters<typeof t>[0])}`}
                            value={themeColors[key]}
                            onChange={(e) =>
                              handleColorChange(key, e.target.value)
                            }
                            className="absolute -inset-1 h-9 w-9 cursor-pointer border-0 p-0"
                          />
                        </div>
                        <Input
                          value={themeColors[key]}
                          onChange={(e) =>
                            handleColorChange(key, e.target.value)
                          }
                          className="h-6 font-mono text-[10px]"
                          placeholder="#000000"
                        />
                      </div>
                    ))}
                  </div>
                ))}

                {/* Accent (single) */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">
                    {t('settings.accentColorLabel')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border shadow-sm">
                      <input
                        type="color"
                        title={t('settings.accentColorLabel')}
                        value={themeColors.accent}
                        onChange={(e) =>
                          handleColorChange('accent', e.target.value)
                        }
                        className="absolute -inset-1 h-11 w-11 cursor-pointer border-0 p-0"
                      />
                    </div>
                    <Input
                      value={themeColors.accent}
                      onChange={(e) =>
                        handleColorChange('accent', e.target.value)
                      }
                      className="h-7 font-mono text-xs"
                      placeholder="#000000"
                    />
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
                          const colors: ThemeColors = {
                            primaryLight: palette.colors[0],
                            primaryDark: palette.colors[0],
                            secondaryLight: palette.colors[1],
                            secondaryDark: palette.colors[1],
                            accent: palette.colors[2],
                            backgroundLight: palette.colors[3],
                            backgroundDark: palette.colors[4]
                          };
                          setThemeColors(colors);
                          const payload = {
                            primary_color: colors.primaryLight,
                            secondary_color: colors.secondaryLight,
                            accent_color: colors.accent,
                            background_color: colors.backgroundLight,
                            dark_mode: null
                          };
                          applyThemeVariables(payload);
                          dispatchThemeUpdate(payload);
                        }}
                        className="flex flex-col gap-1 rounded border p-1.5 text-left transition-all hover:border-primary hover:shadow-sm"
                      >
                        <div className="flex gap-0.5">
                          {palette.colors.slice(0, 4).map((color, i) => (
                            <div
                              key={i}
                              className="h-3.5 w-3.5 rounded-full border border-white/50 shadow-sm"
                              style={{ background: color }}
                            />
                          ))}
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
                        onClick={() =>
                          setThemeStyle((s) => ({ ...s, borderRadius: value }))
                        }
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
                        onClick={() =>
                          setThemeStyle((s) => ({ ...s, shadow: value }))
                        }
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
                    onChange={(e) =>
                      setThemeStyle((s) => ({
                        ...s,
                        backgroundSvgPattern: e.target.value
                      }))
                    }
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

        {/* Center panel — Site preview */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/20 p-4">
          <SitePreview
            blocks={sortedBlocks}
            siteUrl={storefrontUrl}
            activeBlockId={activeBlockId}
            onSelectBlock={handleSelectBlock}
            theme={previewTheme}
            deviceMode={deviceMode}
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
    </div>
  );
}
