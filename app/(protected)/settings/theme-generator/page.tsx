'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Copy,
  Wand2,
  Check,
  Layers,
  Palette,
  Sparkles,
  Zap,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { applyThemeVariables, dispatchThemeUpdate } from '@/lib/theme';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface GeneratorState {
  name: string;
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
  darkMode: boolean | null;
  backgroundAnimationType: string;
  backgroundAnimationSpeed: string;
  backgroundSvgPattern: string;
  elementAnimationStyle: string;
  borderRadiusStyle: 'rounded' | 'soft' | 'sharp';
  shadowStyle: 'none' | 'subtle' | 'medium' | 'strong';
  isDark: boolean;
}

interface ThemePreset {
  id: string;
  name: string;
  category: string;
  state: Omit<GeneratorState, 'name' | 'isDark'>;
}

// ─── Presets ────────────────────────────────────────────────────────────────────

const PRESETS: ThemePreset[] = [
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    category: 'Tech',
    state: {
      primaryLight: '#0ea5e9',
      primaryDark: '#38bdf8',
      secondaryLight: '#6366f1',
      secondaryDark: '#818cf8',
      accent: '#06b6d4',
      backgroundLight: '#f0f9ff',
      backgroundDark: '#0c1a2e',
      darkMode: null,
      backgroundAnimationType: 'gradient',
      backgroundAnimationSpeed: 'medium',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'subtle',
      borderRadiusStyle: 'rounded',
      shadowStyle: 'medium'
    }
  },
  {
    id: 'sunset-luxe',
    name: 'Sunset Luxe',
    category: 'Luxury',
    state: {
      primaryLight: '#f97316',
      primaryDark: '#fb923c',
      secondaryLight: '#a855f7',
      secondaryDark: '#c084fc',
      accent: '#fbbf24',
      backgroundLight: '#fffbf7',
      backgroundDark: '#1a0a2e',
      darkMode: null,
      backgroundAnimationType: 'particles',
      backgroundAnimationSpeed: 'slow',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'moderate',
      borderRadiusStyle: 'sharp',
      shadowStyle: 'strong'
    }
  },
  {
    id: 'forest-natural',
    name: 'Forest Natural',
    category: 'Natural',
    state: {
      primaryLight: '#16a34a',
      primaryDark: '#4ade80',
      secondaryLight: '#65a30d',
      secondaryDark: '#a3e635',
      accent: '#f59e0b',
      backgroundLight: '#f0fdf4',
      backgroundDark: '#052e16',
      darkMode: null,
      backgroundAnimationType: 'waves',
      backgroundAnimationSpeed: 'slow',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'subtle',
      borderRadiusStyle: 'soft',
      shadowStyle: 'subtle'
    }
  },
  {
    id: 'midnight-pro',
    name: 'Midnight Pro',
    category: 'Dark',
    state: {
      primaryLight: '#8b5cf6',
      primaryDark: '#a78bfa',
      secondaryLight: '#6366f1',
      secondaryDark: '#818cf8',
      accent: '#ec4899',
      backgroundLight: '#1e1b4b',
      backgroundDark: '#0a0a1a',
      darkMode: true,
      backgroundAnimationType: 'mesh',
      backgroundAnimationSpeed: 'fast',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'dynamic',
      borderRadiusStyle: 'rounded',
      shadowStyle: 'strong'
    }
  },
  {
    id: 'coral-pop',
    name: 'Coral Pop',
    category: 'Playful',
    state: {
      primaryLight: '#f43f5e',
      primaryDark: '#fb7185',
      secondaryLight: '#f97316',
      secondaryDark: '#fb923c',
      accent: '#fbbf24',
      backgroundLight: '#fff1f2',
      backgroundDark: '#1c0710',
      darkMode: null,
      backgroundAnimationType: 'particles',
      backgroundAnimationSpeed: 'fast',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'dynamic',
      borderRadiusStyle: 'soft',
      shadowStyle: 'medium'
    }
  },
  {
    id: 'arctic-white',
    name: 'Arctic White',
    category: 'Trust',
    state: {
      primaryLight: '#3b82f6',
      primaryDark: '#60a5fa',
      secondaryLight: '#64748b',
      secondaryDark: '#94a3b8',
      accent: '#0ea5e9',
      backgroundLight: '#f8fafc',
      backgroundDark: '#0f172a',
      darkMode: null,
      backgroundAnimationType: 'none',
      backgroundAnimationSpeed: 'medium',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'subtle',
      borderRadiusStyle: 'rounded',
      shadowStyle: 'medium'
    }
  },
  {
    id: 'gold-rush',
    name: 'Gold Rush',
    category: 'Luxury',
    state: {
      primaryLight: '#d97706',
      primaryDark: '#fbbf24',
      secondaryLight: '#92400e',
      secondaryDark: '#b45309',
      accent: '#f59e0b',
      backgroundLight: '#fffbeb',
      backgroundDark: '#1c1008',
      darkMode: null,
      backgroundAnimationType: 'gradient',
      backgroundAnimationSpeed: 'slow',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'moderate',
      borderRadiusStyle: 'sharp',
      shadowStyle: 'none'
    }
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    category: 'Tech',
    state: {
      primaryLight: '#06b6d4',
      primaryDark: '#22d3ee',
      secondaryLight: '#8b5cf6',
      secondaryDark: '#a78bfa',
      accent: '#10b981',
      backgroundLight: '#0f172a',
      backgroundDark: '#020617',
      darkMode: true,
      backgroundAnimationType: 'grid',
      backgroundAnimationSpeed: 'fast',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'dynamic',
      borderRadiusStyle: 'sharp',
      shadowStyle: 'strong'
    }
  },
  {
    id: 'rose-garden',
    name: 'Rose Garden',
    category: 'Beauty',
    state: {
      primaryLight: '#e11d48',
      primaryDark: '#fb7185',
      secondaryLight: '#db2777',
      secondaryDark: '#f472b6',
      accent: '#f9a8d4',
      backgroundLight: '#fff5f7',
      backgroundDark: '#1c0a14',
      darkMode: null,
      backgroundAnimationType: 'particles',
      backgroundAnimationSpeed: 'medium',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'moderate',
      borderRadiusStyle: 'soft',
      shadowStyle: 'subtle'
    }
  },
  {
    id: 'slate-pro',
    name: 'Slate Pro',
    category: 'Business',
    state: {
      primaryLight: '#0f172a',
      primaryDark: '#1e293b',
      secondaryLight: '#334155',
      secondaryDark: '#475569',
      accent: '#3b82f6',
      backgroundLight: '#f1f5f9',
      backgroundDark: '#0f172a',
      darkMode: null,
      backgroundAnimationType: 'none',
      backgroundAnimationSpeed: 'medium',
      backgroundSvgPattern: '',
      elementAnimationStyle: 'subtle',
      borderRadiusStyle: 'rounded',
      shadowStyle: 'subtle'
    }
  }
];

const PALETTE_SUGGESTIONS = [
  { name: 'Cool Blue', colors: ['#3b82f6', '#6366f1', '#0ea5e9', '#f0f9ff'] },
  { name: 'Warm Sunset', colors: ['#f97316', '#f43f5e', '#fbbf24', '#fff7ed'] },
  { name: 'Forest', colors: ['#16a34a', '#65a30d', '#f59e0b', '#f0fdf4'] },
  { name: 'Purple Haze', colors: ['#8b5cf6', '#a855f7', '#ec4899', '#faf5ff'] },
  { name: 'Ocean Deep', colors: ['#0891b2', '#0284c7', '#06b6d4', '#ecfeff'] },
  { name: 'Minimal Dark', colors: ['#0f172a', '#1e293b', '#94a3b8', '#f8fafc'] }
];

const CATEGORY_BADGE_STYLE: Record<string, string> = {
  Tech: 'bg-blue-100 text-blue-700',
  Luxury: 'bg-amber-100 text-amber-700',
  Natural: 'bg-green-100 text-green-700',
  Dark: 'bg-slate-100 text-slate-600',
  Playful: 'bg-pink-100 text-pink-700',
  Trust: 'bg-sky-100 text-sky-700',
  Beauty: 'bg-rose-100 text-rose-700',
  Business: 'bg-gray-100 text-gray-700'
};

const ANIMATION_TYPE_OPTIONS = [
  { value: 'none', label: 'None', icon: '○' },
  { value: 'gradient', label: 'Gradient', icon: '◑' },
  { value: 'particles', label: 'Particles', icon: '✦' },
  { value: 'waves', label: 'Waves', icon: '〜' },
  { value: 'mesh', label: 'Mesh', icon: '⊞' },
  { value: 'grid', label: 'Grid', icon: '⊟' }
];

const BORDER_RADIUS_MAP: Record<string, string> = {
  rounded: '16px',
  soft: '24px',
  sharp: '4px'
};

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  subtle: '0 1px 2px rgba(0,0,0,0.05)',
  medium: '0 4px 12px rgba(0,0,0,0.1)',
  strong: '0 10px 24px rgba(0,0,0,0.15)'
};

const DEFAULT_STATE: GeneratorState = {
  name: 'My Custom Theme',
  isDark: false,
  ...PRESETS[0].state
};

// ─── Storefront Preview ────────────────────────────────────────────────────────

function StorefrontPreview({ state }: { state: GeneratorState }) {
  const bg = state.isDark ? state.backgroundDark : state.backgroundLight;
  const primary = state.isDark ? state.primaryDark : state.primaryLight;
  const secondary = state.isDark ? state.secondaryDark : state.secondaryLight;
  const text = state.isDark ? '#f1f5f9' : '#0f172a';
  const muted = state.isDark ? '#94a3b8' : '#64748b';
  const cardBg = state.isDark ? '#1e293b' : '#ffffff';
  const border = state.isDark ? '#334155' : '#e2e8f0';

  const radius = BORDER_RADIUS_MAP[state.borderRadiusStyle] ?? '16px';
  const shadow = SHADOW_MAP[state.shadowStyle] ?? 'none';
  const heroBg = `linear-gradient(135deg, ${primary}, ${secondary})`;

  return (
    <div
      className="overflow-hidden rounded-xl border text-xs shadow-lg"
      style={{ background: bg, color: text, borderColor: border }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-1.5 border-b px-3 py-2"
        style={{ background: cardBg, borderColor: border }}
      >
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <div
          className="ml-2 h-4 flex-1 rounded px-2 text-[9px] leading-4"
          style={{ background: border, color: muted }}
        >
          yourstore.com
        </div>
      </div>

      {/* Navbar */}
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{ background: cardBg, borderColor: border }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5"
            style={{ background: primary, borderRadius: radius }}
          />
          <span className="font-bold" style={{ color: primary }}>
            Store
          </span>
        </div>
        <div className="flex items-center gap-3">
          {['Home', 'Courses', 'About'].map((item) => (
            <span key={item} className="text-[9px]" style={{ color: muted }}>
              {item}
            </span>
          ))}
          <div
            className="px-2 py-0.5 text-[9px] font-semibold text-white"
            style={{ background: primary, borderRadius: radius }}
          >
            Login
          </div>
        </div>
      </div>

      {/* Hero */}
      <div
        className="relative flex flex-col items-center overflow-hidden px-4 py-6 text-center"
        style={{ background: heroBg }}
      >
        {state.backgroundAnimationType !== 'none' && (
          <div
            className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[8px] font-semibold text-white/80"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            {state.backgroundAnimationType}
          </div>
        )}
        <div className="space-y-1">
          <div
            className="inline-block rounded-full px-2 py-0.5 text-[8px] font-semibold text-white"
            style={{ background: secondary }}
          >
            FEATURED
          </div>
          <div className="text-sm font-bold leading-tight text-white">
            Welcome to Your Academy
          </div>
          <div className="text-[9px] text-white/80">
            Discover world-class courses crafted for you
          </div>
          <div className="flex justify-center gap-2 pt-1">
            <div
              className="px-3 py-1 text-[9px] font-semibold text-white"
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: radius
              }}
            >
              Browse Courses
            </div>
            <div
              className="border px-3 py-1 text-[9px] text-white"
              style={{
                borderColor: 'rgba(255,255,255,0.4)',
                borderRadius: radius
              }}
            >
              Learn More
            </div>
          </div>
        </div>
      </div>

      {/* Course cards */}
      <div className="grid grid-cols-3 gap-2 p-3">
        {[
          { title: 'React Basics', price: '$29', badge: null },
          { title: 'UI Design', price: '$49', badge: '-20%' },
          { title: 'TypeScript', price: '$19', badge: 'New' }
        ].map((course) => (
          <div
            key={course.title}
            className="overflow-hidden"
            style={{
              background: cardBg,
              borderRadius: radius,
              boxShadow: shadow
            }}
          >
            <div
              className="h-10 w-full"
              style={{
                background: `linear-gradient(135deg, ${primary}33, ${secondary}33)`
              }}
            />
            <div className="p-1.5">
              <div className="text-[8px] font-medium" style={{ color: text }}>
                {course.title}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[9px] font-bold"
                  style={{ color: primary }}
                >
                  {course.price}
                </span>
                {course.badge && (
                  <span
                    className="rounded px-1 text-[7px] font-semibold text-white"
                    style={{ background: state.accent, borderRadius: radius }}
                  >
                    {course.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="border-t px-4 py-2 text-center text-[8px]"
        style={{ background: cardBg, borderColor: border, color: muted }}
      >
        © 2026 Your Academy · All rights reserved
      </div>
    </div>
  );
}

// ─── Preset Card ────────────────────────────────────────────────────────────────

function PresetCard({
  preset,
  isSelected,
  onSelect
}: {
  preset: ThemePreset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const heroBg = `linear-gradient(135deg, ${preset.state.primaryLight}, ${preset.state.secondaryLight})`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border-2 text-left transition-all duration-200',
        isSelected
          ? 'border-primary ring-2 ring-primary ring-offset-2'
          : 'border-border hover:border-primary/50 hover:shadow-md'
      )}
    >
      <div className="h-14 w-full" style={{ background: heroBg }} />

      <div
        className="flex items-center gap-1.5 px-3 py-2"
        style={{ background: preset.state.backgroundLight }}
      >
        {[
          preset.state.primaryLight,
          preset.state.secondaryLight,
          preset.state.accent,
          preset.state.backgroundDark
        ].map((color, i) => (
          <div
            key={i}
            className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
            style={{ background: color }}
          />
        ))}
        <span
          className={cn(
            'ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium',
            CATEGORY_BADGE_STYLE[preset.category] ?? 'bg-gray-100 text-gray-700'
          )}
        >
          {preset.category}
        </span>
      </div>

      <div
        className="px-3 pb-2.5"
        style={{ background: preset.state.backgroundLight }}
      >
        <p className="text-sm font-semibold">{preset.name}</p>
        <p className="text-[10px] capitalize text-muted-foreground">
          {preset.state.backgroundAnimationType} ·{' '}
          {preset.state.borderRadiusStyle}
        </p>
      </div>

      {isSelected && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  );
}

// ─── Color Row ─────────────────────────────────────────────────────────────────

function ColorRow({
  label,
  helper,
  lightValue,
  darkValue,
  onLightChange,
  onDarkChange
}: {
  label: string;
  helper?: string;
  lightValue: string;
  darkValue: string;
  onLightChange: (v: string) => void;
  onDarkChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-3">
        {[
          { modeLabel: 'Light', value: lightValue, onChange: onLightChange },
          { modeLabel: 'Dark', value: darkValue, onChange: onDarkChange }
        ].map(({ modeLabel, value, onChange }) => (
          <div key={modeLabel} className="space-y-1">
            <span className="text-xs text-muted-foreground">{modeLabel}</span>
            <div className="flex items-center gap-2">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border shadow-sm">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="absolute -inset-1 h-12 w-12 cursor-pointer border-0 p-0"
                />
              </div>
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 font-mono text-xs"
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

// ─── Option Button ──────────────────────────────────────────────────────────────

function OptionButton({
  label,
  isActive,
  onClick,
  children
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-xs font-medium transition-all',
        isActive
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border text-muted-foreground hover:border-primary/50'
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ThemeGeneratorPage() {
  const { t } = useTranslation();
  const [state, setState] = useState<GeneratorState>(DEFAULT_STATE);
  const [selectedPreset, setSelectedPreset] = useState<string>('ocean-breeze');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = useCallback(
    <K extends keyof GeneratorState>(key: K, value: GeneratorState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const applyPreset = useCallback((preset: ThemePreset) => {
    setSelectedPreset(preset.id);
    setState((prev) => ({ ...prev, name: preset.name, ...preset.state }));
  }, []);

  const buildPayload = () => ({
    name: state.name,
    primary_color: state.primaryLight,
    primary_color_light: state.primaryLight,
    primary_color_dark: state.primaryDark,
    secondary_color: state.secondaryLight,
    secondary_color_light: state.secondaryLight,
    secondary_color_dark: state.secondaryDark,
    accent_color: state.accent,
    background_color: state.backgroundLight,
    background_color_light: state.backgroundLight,
    background_color_dark: state.backgroundDark,
    dark_mode: state.darkMode,
    background_animation_type: state.backgroundAnimationType,
    background_animation_speed: state.backgroundAnimationSpeed,
    background_svg_pattern: state.backgroundSvgPattern,
    element_animation_style: state.elementAnimationStyle,
    border_radius_style: state.borderRadiusStyle,
    shadow_style: state.shadowStyle
  });

  const handleApplyToStore = async () => {
    try {
      setIsSaving(true);
      const payload = buildPayload();
      await apiClient.updateCurrentThemeConfig(payload);
      applyThemeVariables(payload);
      dispatchThemeUpdate(payload);
      ErrorHandler.showSuccess(t('settings.themeGeneratorApplied'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(buildPayload(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Wand2 className="h-7 w-7 text-primary" />
            {t('settings.themeGeneratorTitle')}
          </h1>
          <p className="text-muted-foreground">
            {t('settings.themeGeneratorSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyConfig}>
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? t('settings.copied') : t('settings.copyConfig')}
          </Button>
          <Button onClick={handleApplyToStore} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t('settings.applying') : t('settings.applyToStore')}
          </Button>
        </div>
      </div>

      {/* Theme name */}
      <div className="flex items-center gap-3">
        <Label htmlFor="theme-name" className="shrink-0 text-sm font-medium">
          {t('settings.themeName')}
        </Label>
        <Input
          id="theme-name"
          value={state.name}
          onChange={(e) => update('name', e.target.value)}
          className="max-w-xs"
          placeholder={t('settings.themeNamePlaceholder')}
        />
      </div>

      {/* Main grid: controls | preview */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Controls */}
        <Tabs defaultValue="presets" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {t('settings.presets')}
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="mr-1.5 h-3.5 w-3.5" />
              {t('settings.colors')}
            </TabsTrigger>
            <TabsTrigger value="effects">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {t('settings.effects')}
            </TabsTrigger>
            <TabsTrigger value="style">
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              {t('settings.style')}
            </TabsTrigger>
          </TabsList>

          {/* ── Presets ── */}
          <TabsContent value="presets">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>{t('settings.presetsTitle')}</CardTitle>
                <CardDescription>
                  {t('settings.presetsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
                  {PRESETS.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      isSelected={selectedPreset === preset.id}
                      onSelect={() => applyPreset(preset)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Colors ── */}
          <TabsContent value="colors">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>{t('settings.colorPaletteTitle')}</CardTitle>
                <CardDescription>
                  {t('settings.colorPaletteDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark mode toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('settings.darkModeLabel')}
                  </Label>
                  <div className="flex gap-2">
                    {[
                      {
                        value: false as boolean | null,
                        label: t('settings.lightMode'),
                        Icon: Sun
                      },
                      {
                        value: true as boolean | null,
                        label: t('settings.darkMode'),
                        Icon: Moon
                      },
                      {
                        value: null as boolean | null,
                        label: t('settings.systemPreference'),
                        Icon: Monitor
                      }
                    ].map(({ value, label, Icon }) => (
                      <button
                        key={String(value)}
                        type="button"
                        onClick={() => update('darkMode', value)}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all',
                          state.darkMode === value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <ColorRow
                  label={t('settings.colorPrimary')}
                  helper={t('settings.colorPrimaryHelper')}
                  lightValue={state.primaryLight}
                  darkValue={state.primaryDark}
                  onLightChange={(v) => update('primaryLight', v)}
                  onDarkChange={(v) => update('primaryDark', v)}
                />
                <Separator />
                <ColorRow
                  label={t('settings.colorSecondary')}
                  helper={t('settings.colorSecondaryHelper')}
                  lightValue={state.secondaryLight}
                  darkValue={state.secondaryDark}
                  onLightChange={(v) => update('secondaryLight', v)}
                  onDarkChange={(v) => update('secondaryDark', v)}
                />
                <Separator />
                <ColorRow
                  label={t('settings.colorBackground')}
                  helper={t('settings.colorBackgroundHelper')}
                  lightValue={state.backgroundLight}
                  darkValue={state.backgroundDark}
                  onLightChange={(v) => update('backgroundLight', v)}
                  onDarkChange={(v) => update('backgroundDark', v)}
                />
                <Separator />

                {/* Accent */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('settings.colorAccent')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border shadow-sm">
                      <input
                        type="color"
                        value={state.accent}
                        onChange={(e) => update('accent', e.target.value)}
                        className="absolute -inset-1 h-12 w-12 cursor-pointer border-0 p-0"
                      />
                    </div>
                    <Input
                      value={state.accent}
                      onChange={(e) => update('accent', e.target.value)}
                      className="h-9 max-w-xs font-mono text-xs"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.colorAccentHelper')}
                  </p>
                </div>

                <Separator />

                {/* Quick palettes */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {t('settings.quickPalettes')}
                  </Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PALETTE_SUGGESTIONS.map((palette) => (
                      <button
                        key={palette.name}
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            primaryLight: palette.colors[0],
                            primaryDark: palette.colors[0],
                            secondaryLight: palette.colors[1],
                            secondaryDark: palette.colors[1],
                            accent: palette.colors[2],
                            backgroundLight: palette.colors[3]
                          }))
                        }
                        className="flex flex-col gap-1.5 rounded-lg border p-2.5 text-left transition-all hover:border-primary hover:shadow-sm"
                      >
                        <div className="flex gap-1">
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                              style={{ background: color }}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-medium">
                          {palette.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Effects ── */}
          <TabsContent value="effects">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>{t('settings.effectsTitle')}</CardTitle>
                <CardDescription>
                  {t('settings.effectsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Animation type */}
                <div className="space-y-3">
                  <Label>{t('settings.backgroundAnimation')}</Label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {ANIMATION_TYPE_OPTIONS.map((opt) => (
                      <OptionButton
                        key={opt.value}
                        label={opt.label}
                        isActive={state.backgroundAnimationType === opt.value}
                        onClick={() =>
                          update('backgroundAnimationType', opt.value)
                        }
                      >
                        <span className="text-lg">{opt.icon}</span>
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* Animation speed */}
                {state.backgroundAnimationType !== 'none' && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label>{t('settings.animationSpeed')}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['slow', 'medium', 'fast'] as const).map((speed) => (
                          <OptionButton
                            key={speed}
                            label={
                              speed.charAt(0).toUpperCase() + speed.slice(1)
                            }
                            isActive={state.backgroundAnimationSpeed === speed}
                            onClick={() =>
                              update('backgroundAnimationSpeed', speed)
                            }
                          >
                            <div className="flex gap-0.5">
                              {Array.from({
                                length:
                                  speed === 'slow'
                                    ? 1
                                    : speed === 'medium'
                                      ? 2
                                      : 3
                              }).map((_, i) => (
                                <div
                                  key={i}
                                  className="h-3 w-1 rounded-full bg-current opacity-70"
                                />
                              ))}
                            </div>
                          </OptionButton>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* SVG pattern (optional) */}
                <Separator />
                <div className="space-y-2">
                  <Label>{t('settings.svgPattern')}</Label>
                  <Input
                    value={state.backgroundSvgPattern}
                    onChange={(e) =>
                      update('backgroundSvgPattern', e.target.value)
                    }
                    placeholder="dots, grid, waves, circles..."
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('settings.svgPatternHelper')}
                  </p>
                </div>

                {/* Live preview strip */}
                <div
                  className="h-20 w-full overflow-hidden rounded-xl shadow-inner"
                  style={{
                    background: `linear-gradient(135deg, ${state.primaryLight}, ${state.secondaryLight})`
                  }}
                >
                  <div className="flex h-full items-center justify-center text-xs font-medium text-white/80">
                    {state.backgroundAnimationType === 'none'
                      ? 'No animation — solid background'
                      : `${state.backgroundAnimationType} at ${state.backgroundAnimationSpeed} speed`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Style ── */}
          <TabsContent value="style">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>{t('settings.styleTitle')}</CardTitle>
                <CardDescription>
                  {t('settings.styleDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Border radius */}
                <div className="space-y-3">
                  <Label>{t('settings.borderRadius')}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: 'rounded' as const,
                        label: 'Rounded',
                        radius: '16px'
                      },
                      { value: 'soft' as const, label: 'Soft', radius: '24px' },
                      { value: 'sharp' as const, label: 'Sharp', radius: '4px' }
                    ].map(({ value, label, radius }) => (
                      <OptionButton
                        key={value}
                        label={label}
                        isActive={state.borderRadiusStyle === value}
                        onClick={() => update('borderRadiusStyle', value)}
                      >
                        <div
                          className="h-10 w-14 border-2 border-primary/40 bg-primary/20"
                          style={{ borderRadius: radius }}
                        />
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shadow */}
                <div className="space-y-3">
                  <Label>{t('settings.shadowStyle')}</Label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { value: 'none' as const, label: 'None', shadow: 'none' },
                      {
                        value: 'subtle' as const,
                        label: 'Subtle',
                        shadow: '0 1px 4px rgba(0,0,0,0.08)'
                      },
                      {
                        value: 'medium' as const,
                        label: 'Medium',
                        shadow: '0 4px 12px rgba(0,0,0,0.12)'
                      },
                      {
                        value: 'strong' as const,
                        label: 'Strong',
                        shadow: '0 10px 24px rgba(0,0,0,0.18)'
                      }
                    ].map(({ value, label, shadow }) => (
                      <OptionButton
                        key={value}
                        label={label}
                        isActive={state.shadowStyle === value}
                        onClick={() => update('shadowStyle', value)}
                      >
                        <div
                          className="h-10 w-14 rounded-lg bg-white dark:bg-slate-700"
                          style={{ boxShadow: shadow }}
                        />
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Element animation */}
                <div className="space-y-3">
                  <Label>{t('settings.elementAnimation')}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: 'subtle',
                        label: 'Subtle',
                        desc: 'Gentle transitions'
                      },
                      {
                        value: 'moderate',
                        label: 'Moderate',
                        desc: 'Smooth motion'
                      },
                      {
                        value: 'dynamic',
                        label: 'Dynamic',
                        desc: 'Bold animations'
                      }
                    ].map(({ value, label, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update('elementAnimationStyle', value)}
                        className={cn(
                          'flex flex-col gap-1.5 rounded-xl border-2 p-3 text-left transition-all',
                          state.elementAnimationStyle === value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <span className="text-sm font-semibold">{label}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview panel */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('settings.livePreview')}
                </CardTitle>
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, isDark: !prev.isDark }))
                  }
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    state.isDark
                      ? 'border-slate-600 bg-slate-800 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  )}
                >
                  {state.isDark ? '🌙 Dark' : '☀️ Light'}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <StorefrontPreview state={state} />
            </CardContent>
          </Card>

          {/* Config summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('settings.configSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                { label: 'Border Radius', value: state.borderRadiusStyle },
                { label: 'Shadow', value: state.shadowStyle },
                { label: 'Animation', value: state.backgroundAnimationType },
                { label: 'Speed', value: state.backgroundAnimationSpeed },
                { label: 'Elements', value: state.elementAnimationStyle },
                {
                  label: 'Dark Mode',
                  value:
                    state.darkMode === null
                      ? 'system'
                      : state.darkMode
                        ? 'dark'
                        : 'light'
                }
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono capitalize">
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
