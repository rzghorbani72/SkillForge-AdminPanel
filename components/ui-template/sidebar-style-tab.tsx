'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { derivePaletteFromPrimary } from '@/lib/design-system-palette';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  BorderRadius,
  ElementAnimation,
  Shadow,
  SectionSpacing,
  ContainerWidth,
  HeadingScale,
  FontFamily,
  TextDirection
} from './sidebar-types';
import { FONT_OPTIONS } from './sidebar-types';
import { AccordionSection } from './sidebar-primitives';

// Named palettes expose ONLY a primary color. Every other shade (accent,
// background, contrast text) is derived by derivePaletteFromPrimary, so a
// manager can never pick an unreadable primary/background combination.
const COLOR_PALETTES: { nameKey: string; primary: string }[] = [
  { nameKey: 'sitePreview.paletteOcean', primary: '#3b82f6' },
  { nameKey: 'sitePreview.palettePurple', primary: '#8b5cf6' },
  { nameKey: 'sitePreview.paletteGreen', primary: '#22c55e' },
  { nameKey: 'sitePreview.paletteOrange', primary: '#f97316' },
  { nameKey: 'sitePreview.paletteRed', primary: '#ef4444' },
  { nameKey: 'sitePreview.palettePink', primary: '#ec4899' },
  { nameKey: 'sitePreview.paletteTeal', primary: '#14b8a6' },
  { nameKey: 'sitePreview.paletteGold', primary: '#f59e0b' },
  { nameKey: 'sitePreview.paletteBlack', primary: '#27272a' }
];

// Ordered by how round each option actually renders. The px values are the
// single source of truth shared with Backend theme-css.util.ts and edusphere
// theme-apply.ts — if those maps change, change these together or the sidebar
// preview stops matching the published site.
const RADIUS_PRESETS: {
  labelKey: string;
  value: BorderRadius;
  px: number;
}[] = [
  { labelKey: 'sitePreview.cornerSharp', value: 'sharp', px: 4 },
  { labelKey: 'sitePreview.cornerRound', value: 'rounded', px: 16 },
  { labelKey: 'sitePreview.cornerExtraRound', value: 'soft', px: 24 }
];

// ── Brand Color ───────────────────────────────────────────────────────────────

// Readable text color for a swatch — white on dark, near-black on light. Keeps
// the preview's button label legible for any primary (e.g. yellow vs navy).
function readableText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? '#18181b' : '#ffffff';
}

const SCHEME_ROLES = [
  { labelKey: 'sitePreview.colorRolePrimary', key: 'primary' as const },
  { labelKey: 'sitePreview.colorRoleAccent', key: 'accent' as const },
  {
    labelKey: 'sitePreview.colorRoleBackground',
    key: 'backgroundLight' as const
  }
];

// Wix/Zarla-style color-theme preview: a mini storefront swatch rendered with
// the FULL derived scheme (background, text, primary, accent) plus a labelled
// role strip, so the manager sees the whole palette they're applying.
function ColorPreview({ color }: { color: string }) {
  const { t } = useTranslation();
  const p = derivePaletteFromPrimary(color);
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <div
        className="px-3 py-2.5"
        style={{ backgroundColor: p.backgroundLight }}
        dir="rtl"
      >
        <p className="truncate text-sm font-bold" style={{ color: '#18181b' }}>
          {t('sitePreview.colorPreviewTitle')}
        </p>
        <p className="mb-2 truncate text-[11px]" style={{ color: '#52525b' }}>
          {t('sitePreview.colorPreviewBody')}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-3 py-1 text-[11px] font-semibold"
            style={{ background: p.primary, color: readableText(p.primary) }}
          >
            {t('sitePreview.colorPreviewButton')}
          </span>
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: p.accent }}
          />
        </div>
      </div>
      <div className="flex border-t border-zinc-200">
        {SCHEME_ROLES.map(({ labelKey, key }) => (
          <div
            key={key}
            className="flex-1 border-r border-zinc-200 last:border-r-0"
          >
            <div className="h-4" style={{ backgroundColor: p[key] }} />
            <p className="py-0.5 text-center text-[8px] text-zinc-500">
              {t(labelKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaletteCard({
  name,
  primary,
  selected,
  onSelect
}: {
  name: string;
  primary: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const palette = derivePaletteFromPrimary(primary);
  const swatches = [palette.primary, palette.accent, palette.backgroundLight];

  return (
    <button
      type="button"
      onClick={onSelect}
      title={name}
      className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400'
      }`}
    >
      <span className="flex flex-shrink-0 overflow-hidden rounded-md border border-black/20">
        {swatches.map((c, i) => (
          <span key={i} className="h-6 w-3.5" style={{ backgroundColor: c }} />
        ))}
      </span>
      <span className="truncate text-xs font-medium text-zinc-800">{name}</span>
    </button>
  );
}

function BrandColorSection({
  primaryColor,
  onColorChange
}: {
  primaryColor: string;
  onColorChange: (c: string) => void;
}) {
  const { t } = useTranslation();
  const [hexInput, setHexInput] = useState(primaryColor);
  const [showCustom, setShowCustom] = useState(false);

  // Keep the text field in step when the colour changes elsewhere (a palette
  // click, a reset). Adjusting during render, not in an effect, avoids a second
  // paint with the stale value.
  const [lastColor, setLastColor] = useState(primaryColor);
  if (primaryColor !== lastColor) {
    setLastColor(primaryColor);
    setHexInput(primaryColor);
  }

  const commit = (value: string) => {
    setHexInput(value);
    onColorChange(value);
  };

  const applyHex = () => {
    const val = hexInput.trim();
    const normalized = val.startsWith('#') ? val : `#${val}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      commit(normalized);
    }
  };

  const isPreset = COLOR_PALETTES.some(
    (p) => p.primary.toLowerCase() === primaryColor.toLowerCase()
  );

  return (
    <AccordionSection title={t('sitePreview.colorBrand')} defaultOpen>
      <div className="space-y-3">
        <ColorPreview color={primaryColor} />

        <div className="grid grid-cols-2 gap-1.5">
          {COLOR_PALETTES.map((p) => (
            <PaletteCard
              key={p.primary}
              name={t(p.nameKey)}
              primary={p.primary}
              selected={primaryColor.toLowerCase() === p.primary.toLowerCase()}
              onSelect={() => commit(p.primary)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className="text-[11px] font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          {showCustom
            ? t('sitePreview.colorCustomClose')
            : t('sitePreview.colorCustomOpen')}
        </button>

        {(showCustom || !isPreset) && (
          <div className="flex items-center gap-2">
            {/* Native picker and hex field write the same value, so a manager
                can either point at a colour or paste a brand code. */}
            <input
              type="color"
              aria-label={t('sitePreview.colorCustom')}
              title={t('sitePreview.colorCustom')}
              value={
                /^#[0-9a-fA-F]{6}$/.test(primaryColor)
                  ? primaryColor
                  : '#3B82F6'
              }
              onChange={(e) => commit(e.target.value)}
              className="h-8 w-9 flex-shrink-0 cursor-pointer rounded-lg border border-zinc-300 bg-transparent p-0.5"
            />
            <Input
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={applyHex}
              onKeyDown={(e) => e.key === 'Enter' && applyHex()}
              placeholder="#3B82F6"
              dir="ltr"
              className="h-8 flex-1 border-zinc-300 bg-zinc-100 text-xs text-zinc-800 placeholder:text-zinc-600"
            />
          </div>
        )}
      </div>
    </AccordionSection>
  );
}

// ── Font Family ───────────────────────────────────────────────────────────────

const SCRIPT_GROUPS: { script: 'arabic' | 'latin'; labelKey: string }[] = [
  { script: 'arabic', labelKey: 'sitePreview.fontScriptArabic' },
  { script: 'latin', labelKey: 'sitePreview.fontScriptLatin' }
];

function FontPreview({ fontFamily }: { fontFamily: FontFamily }) {
  const { t } = useTranslation();
  const css = FONT_OPTIONS.find((f) => f.slug === fontFamily)?.preview;
  return (
    <div
      className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center"
      style={{ fontFamily: css }}
    >
      <p className="text-lg font-bold text-zinc-900">
        {t('sitePreview.fontPreviewTitle')}
      </p>
      <p className="text-sm text-zinc-600">
        {t('sitePreview.fontPreviewSubtitle')}
      </p>
    </div>
  );
}

function FontFamilySection({
  fontFamily,
  onFontFamilyChange
}: {
  fontFamily: FontFamily;
  onFontFamilyChange: (f: FontFamily) => void;
}) {
  const { t } = useTranslation();
  return (
    <AccordionSection title={t('sitePreview.fontFamilyTitle')}>
      <div className="space-y-3">
        <FontPreview fontFamily={fontFamily} />
        {SCRIPT_GROUPS.map(({ script, labelKey }) => {
          const group = FONT_OPTIONS.filter((f) => f.script === script);
          return (
            <div key={script}>
              <p className="mb-1.5 text-[10px] font-semibold text-zinc-500">
                {t(labelKey)}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {group.map((font) => (
                  <button
                    key={font.slug}
                    type="button"
                    onClick={() => onFontFamilyChange(font.slug)}
                    style={{ fontFamily: font.preview }}
                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                      fontFamily === font.slug
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AccordionSection>
  );
}

// ── Rounded Corners ───────────────────────────────────────────────────────────

function RoundedCornersSection({
  borderRadius,
  onBorderRadiusChange
}: {
  borderRadius: BorderRadius;
  onBorderRadiusChange: (r: BorderRadius) => void;
}) {
  const { t } = useTranslation();

  return (
    <AccordionSection title={t('sitePreview.cornerRadius')}>
      <div className="grid grid-cols-3 gap-1.5">
        {RADIUS_PRESETS.map(({ labelKey, value, px }) => {
          const selected = borderRadius === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onBorderRadiusChange(value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-2.5 transition-colors ${
                selected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <span
                className="h-8 w-full border-2 border-zinc-400 bg-white"
                style={{ borderRadius: `${px}px` }}
              />
              <span className="text-[11px] font-medium text-zinc-700">
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </AccordionSection>
  );
}

// ── Theme Mode ────────────────────────────────────────────────────────────────

function ThemeModeSection({
  darkMode,
  onDarkModeChange
}: {
  darkMode: boolean | null;
  onDarkModeChange: (m: boolean | null) => void;
}) {
  const { t } = useTranslation();
  const modes: {
    label: string;
    desc: string;
    icon: string;
    value: boolean | null;
  }[] = [
    {
      label: t('sitePreview.themeModeLight'),
      desc: t('sitePreview.themeModeLightDesc'),
      icon: '☀️',
      value: false
    },
    {
      label: t('sitePreview.themeModeDark'),
      desc: t('sitePreview.themeModeDarkDesc'),
      icon: '🌙',
      value: true
    },
    {
      label: t('sitePreview.themeModeBoth'),
      desc: t('sitePreview.themeModeBothDesc'),
      icon: '🌗',
      value: null
    }
  ];

  return (
    <AccordionSection title={t('sitePreview.themeMode')}>
      <div className="space-y-2">
        {modes.map((mode) => (
          <button
            key={mode.label}
            type="button"
            onClick={() => onDarkModeChange(mode.value)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition-all ${
              darkMode === mode.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <span className="text-base">{mode.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800">{mode.label}</p>
              <p className="text-[10px] text-zinc-500">{mode.desc}</p>
            </div>
            {darkMode === mode.value && (
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>
    </AccordionSection>
  );
}

// ── Motion & Shadow ───────────────────────────────────────────────────────────

const MOTION_OPTIONS: { labelKey: string; value: ElementAnimation }[] = [
  { labelKey: 'sitePreview.motionNone', value: 'none' },
  { labelKey: 'sitePreview.motionSubtle', value: 'subtle' },
  { labelKey: 'sitePreview.motionModerate', value: 'moderate' },
  { labelKey: 'sitePreview.motionDynamic', value: 'dynamic' }
];

const SHADOW_OPTIONS: { labelKey: string; value: Shadow; css: string }[] = [
  { labelKey: 'sitePreview.shadowNone', value: 'none', css: 'none' },
  {
    labelKey: 'sitePreview.shadowSubtle',
    value: 'subtle',
    css: '0 1px 2px 0 rgba(0,0,0,0.05)'
  },
  {
    labelKey: 'sitePreview.shadowMedium',
    value: 'medium',
    css: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
  },
  {
    labelKey: 'sitePreview.shadowStrong',
    value: 'strong',
    css: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
  }
];

function MotionSection({
  elementAnimation,
  onElementAnimationChange
}: {
  elementAnimation: ElementAnimation;
  onElementAnimationChange: (a: ElementAnimation) => void;
}) {
  const { t } = useTranslation();
  return (
    <AccordionSection title={t('sitePreview.motionTitle')}>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          {MOTION_OPTIONS.map(({ labelKey, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onElementAnimationChange(value)}
              className={`rounded-lg border py-2 text-[11px] font-medium transition-colors ${
                elementAnimation === value
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <p className="text-[10px] leading-relaxed text-zinc-500">
          {t('sitePreview.motionHint')}
        </p>
      </div>
    </AccordionSection>
  );
}

function ShadowSection({
  shadow,
  onShadowChange
}: {
  shadow: Shadow;
  onShadowChange: (s: Shadow) => void;
}) {
  const { t } = useTranslation();
  return (
    <AccordionSection title={t('sitePreview.shadowTitle')}>
      <div className="grid grid-cols-4 gap-1.5">
        {SHADOW_OPTIONS.map(({ labelKey, value, css }) => (
          <button
            key={value}
            type="button"
            onClick={() => onShadowChange(value)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-1 py-2 transition-colors ${
              shadow === value
                ? 'border-blue-500 bg-blue-50'
                : 'border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <span
              className="h-6 w-full rounded bg-white"
              style={{ boxShadow: css }}
            />
            <span className="text-[10px] font-medium text-zinc-700">
              {t(labelKey)}
            </span>
          </button>
        ))}
      </div>
    </AccordionSection>
  );
}

// ── Design Sizes ──────────────────────────────────────────────────────────────

const SPACING_OPTIONS: { labelKey: string; value: SectionSpacing }[] = [
  { labelKey: 'sitePreview.designSpacingCompact', value: 'compact' },
  { labelKey: 'sitePreview.designSpacingNormal', value: 'comfortable' },
  { labelKey: 'sitePreview.designSpacingSpacious', value: 'spacious' }
];
const WIDTH_OPTIONS: { labelKey: string; value: ContainerWidth }[] = [
  { labelKey: 'sitePreview.designWidthNarrow', value: 'narrow' },
  { labelKey: 'sitePreview.designWidthNormal', value: 'standard' },
  { labelKey: 'sitePreview.designWidthWide', value: 'wide' },
  { labelKey: 'sitePreview.designWidthFull', value: 'full' }
];
const HEADING_OPTIONS: { labelKey: string; value: HeadingScale }[] = [
  { labelKey: 'sitePreview.designHeadingSmall', value: 'compact' },
  { labelKey: 'sitePreview.designHeadingNormal', value: 'standard' },
  { labelKey: 'sitePreview.designHeadingLarge', value: 'large' }
];

function SizeRow<T extends string>({
  title,
  options,
  value,
  onChange
}: {
  title: string;
  options: { labelKey: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-zinc-600">{title}</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded py-1.5 text-[11px] font-medium transition-colors ${
              value === o.value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {t(o.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

function DesignSizeSection({
  sectionSpacing,
  containerWidth,
  headingScale,
  onChange
}: {
  sectionSpacing: SectionSpacing;
  containerWidth: ContainerWidth;
  headingScale: HeadingScale;
  onChange: (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => void;
}) {
  const { t } = useTranslation();
  return (
    <AccordionSection title={t('sitePreview.designSizes')}>
      <div className="space-y-4">
        <SizeRow
          title={t('sitePreview.designSpacing')}
          options={SPACING_OPTIONS}
          value={sectionSpacing}
          onChange={(v) => onChange({ section_spacing: v })}
        />
        <SizeRow
          title={t('sitePreview.designWidth')}
          options={WIDTH_OPTIONS}
          value={containerWidth}
          onChange={(v) => onChange({ container_width: v })}
        />
        <SizeRow
          title={t('sitePreview.designHeading')}
          options={HEADING_OPTIONS}
          value={headingScale}
          onChange={(v) => onChange({ heading_scale: v })}
        />
      </div>
    </AccordionSection>
  );
}

// ── Text Direction ────────────────────────────────────────────────────────────

function DirectionSection({
  textDirection,
  onTextDirectionChange
}: {
  textDirection: TextDirection;
  onTextDirectionChange: (d: TextDirection) => void;
}) {
  const { t } = useTranslation();
  const options: {
    label: string;
    desc: string;
    icon: string;
    value: TextDirection;
  }[] = [
    {
      label: t('sitePreview.textDirectionRtl'),
      desc: t('sitePreview.textDirectionRtlDesc'),
      icon: '←',
      value: 'rtl'
    },
    {
      label: t('sitePreview.textDirectionLtr'),
      desc: t('sitePreview.textDirectionLtrDesc'),
      icon: '→',
      value: 'ltr'
    }
  ];

  return (
    <AccordionSection title={t('sitePreview.textDirectionTitle')}>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTextDirectionChange(opt.value)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition-all ${
              textDirection === opt.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <span className="text-base font-bold text-zinc-600">
              {opt.icon}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800">{opt.label}</p>
              <p className="text-[10px] text-zinc-500">{opt.desc}</p>
            </div>
            {textDirection === opt.value && (
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>
    </AccordionSection>
  );
}

// ── Main Style Tab ────────────────────────────────────────────────────────────

export interface SidebarStyleTabProps {
  primaryColor: string;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  shadow: Shadow;
  elementAnimation: ElementAnimation;
  darkMode: boolean | null;
  textDirection: TextDirection;
  sectionSpacing: SectionSpacing;
  containerWidth: ContainerWidth;
  headingScale: HeadingScale;
  onColorChange: (color: string) => void;
  onFontFamilyChange: (f: FontFamily) => void;
  onBorderRadiusChange: (r: BorderRadius) => void;
  onShadowChange: (s: Shadow) => void;
  onElementAnimationChange: (a: ElementAnimation) => void;
  onDarkModeChange: (mode: boolean | null) => void;
  onTextDirectionChange: (d: TextDirection) => void;
  onDesignSizeChange: (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => void;
}

export function SidebarStyleTab({
  primaryColor,
  fontFamily,
  borderRadius,
  shadow,
  elementAnimation,
  darkMode,
  textDirection,
  sectionSpacing,
  containerWidth,
  headingScale,
  onColorChange,
  onFontFamilyChange,
  onBorderRadiusChange,
  onShadowChange,
  onElementAnimationChange,
  onDarkModeChange,
  onTextDirectionChange,
  onDesignSizeChange
}: SidebarStyleTabProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  return (
    <div>
      <BrandColorSection
        primaryColor={primaryColor}
        onColorChange={onColorChange}
      />
      <FontFamilySection
        fontFamily={fontFamily}
        onFontFamilyChange={onFontFamilyChange}
      />
      <ThemeModeSection
        darkMode={darkMode}
        onDarkModeChange={onDarkModeChange}
      />

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex w-full items-center justify-between border-b border-zinc-200 px-4 py-3 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      >
        <span>{t('sitePreview.moreAppearance')}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`}
        />
      </button>

      {showMore && (
        <>
          <DirectionSection
            textDirection={textDirection}
            onTextDirectionChange={onTextDirectionChange}
          />
          <RoundedCornersSection
            borderRadius={borderRadius}
            onBorderRadiusChange={onBorderRadiusChange}
          />
          <ShadowSection shadow={shadow} onShadowChange={onShadowChange} />
          <MotionSection
            elementAnimation={elementAnimation}
            onElementAnimationChange={onElementAnimationChange}
          />
          <DesignSizeSection
            sectionSpacing={sectionSpacing}
            containerWidth={containerWidth}
            headingScale={headingScale}
            onChange={onDesignSizeChange}
          />
        </>
      )}
    </div>
  );
}
