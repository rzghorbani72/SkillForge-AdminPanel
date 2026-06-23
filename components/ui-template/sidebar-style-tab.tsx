'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { hexToHsl, hslToHex } from '@/lib/design-system-palette';
import type { UIBlockConfig } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import type {
  BorderRadius,
  SectionSpacing,
  ContainerWidth,
  HeadingScale,
  FontFamily
} from './sidebar-types';
import { FONT_FAMILIES } from './sidebar-types';
import { AccordionSection } from './sidebar-primitives';

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#22c55e',
  '#8b5cf6',
  '#3b82f6',
  '#84cc16',
  '#7c3aed',
  '#f59e0b',
  '#ec4899'
];

const RADIUS_PRESETS: { label: string; value: BorderRadius }[] = [
  { label: 'تیز', value: 'sharp' },
  { label: 'معمول', value: 'soft' },
  { label: 'گرد', value: 'rounded' }
];

const RADIUS_PX: Record<BorderRadius, number> = {
  sharp: 2,
  soft: 8,
  rounded: 16
};

const SAMPLE_BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&q=70',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=70',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=70',
  'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400&q=70',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&q=70',
  'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&q=70'
];

// ── Brand Color ───────────────────────────────────────────────────────────────

function ColorPreview({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-2.5"
      dir="rtl"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-bold" style={{ color }}>
          عنوان نمونه
        </p>
        <p className="truncate text-[11px] text-zinc-400">متن توضیحی کوچک‌تر</p>
      </div>
      <span
        className="flex-shrink-0 rounded-md px-3 py-1 text-[11px] font-semibold text-white"
        style={{ background: color }}
      >
        دکمه
      </span>
    </div>
  );
}

function ColorSlider({
  label,
  min,
  max,
  value,
  track,
  onChange
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  track: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="font-mono text-xs text-zinc-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        title={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full border border-zinc-600"
        style={{ background: track }}
      />
    </div>
  );
}

function BrandColorSection({
  primaryColor,
  onColorChange
}: {
  primaryColor: string;
  onColorChange: (c: string) => void;
}) {
  const [hexInput, setHexInput] = useState(primaryColor);
  const [showPicker, setShowPicker] = useState(false);

  const applyHex = () => {
    const val = hexInput.trim();
    const normalized = val.startsWith('#') ? val : `#${val}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      onColorChange(normalized);
    }
  };

  const hsl = hexToHsl(primaryColor);
  const emitHsl = (h: number, s: number, l: number) => {
    const hex = hslToHex(h, s, l);
    setHexInput(hex);
    onColorChange(hex);
  };

  return (
    <AccordionSection title="رنگ برند" defaultOpen>
      <div className="space-y-3">
        <ColorPreview color={primaryColor} />

        <div className="grid grid-cols-5 gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => {
                onColorChange(color);
                setHexInput(color);
              }}
              className="h-8 w-full rounded-lg border-2 transition-all duration-150"
              style={{
                backgroundColor: color,
                borderColor: primaryColor === color ? '#fff' : 'transparent',
                transform: primaryColor === color ? 'scale(1.12)' : undefined,
                boxShadow:
                  primaryColor === color ? `0 0 0 2px ${color}55` : undefined
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="انتخاب رنگ سفارشی"
            title="انتخاب رنگ سفارشی"
            onClick={() => setShowPicker((v) => !v)}
            className="h-8 w-9 flex-shrink-0 cursor-pointer rounded-lg border border-zinc-600"
            style={{ backgroundColor: primaryColor }}
          />
          <Input
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={applyHex}
            onKeyDown={(e) => e.key === 'Enter' && applyHex()}
            placeholder="#3B82F6"
            className="h-8 flex-1 border-zinc-600 bg-zinc-800 font-mono text-xs text-zinc-200 placeholder:text-zinc-600"
          />
        </div>

        {showPicker && (
          <div className="space-y-2.5 rounded-lg border border-zinc-700 bg-zinc-800/40 p-3">
            <ColorSlider
              label="رنگ"
              min={0}
              max={360}
              value={Math.round(hsl.h)}
              track="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
              onChange={(h) => emitHsl(h, hsl.s, hsl.l)}
            />
            <ColorSlider
              label="اشباع"
              min={0}
              max={100}
              value={Math.round(hsl.s)}
              track={`linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`}
              onChange={(s) => emitHsl(hsl.h, s, hsl.l)}
            />
            <ColorSlider
              label="روشنایی"
              min={0}
              max={100}
              value={Math.round(hsl.l)}
              track={`linear-gradient(to right, #000, ${hslToHex(hsl.h, hsl.s, 50)}, #fff)`}
              onChange={(l) => emitHsl(hsl.h, hsl.s, l)}
            />
          </div>
        )}
      </div>
    </AccordionSection>
  );
}

// ── Font Family ───────────────────────────────────────────────────────────────

function FontFamilySection({
  fontFamily,
  onFontFamilyChange
}: {
  fontFamily: FontFamily;
  onFontFamilyChange: (f: FontFamily) => void;
}) {
  return (
    <AccordionSection title="فونت">
      <div className="grid grid-cols-2 gap-1.5">
        {FONT_FAMILIES.map((font) => (
          <button
            key={font}
            type="button"
            onClick={() => onFontFamilyChange(font)}
            className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
              fontFamily === font
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {font}
          </button>
        ))}
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
  const cardPx = RADIUS_PX[borderRadius];
  const cardToRadius = (px: number): BorderRadius =>
    px <= 3 ? 'sharp' : px <= 12 ? 'soft' : 'rounded';

  return (
    <AccordionSection title="گوشه‌های گرد">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">شعاع کارت‌ها</span>
            <span className="font-mono text-xs text-zinc-300">{cardPx}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            value={cardPx}
            title="شعاع کارت‌ها"
            onChange={(e) =>
              onBorderRadiusChange(cardToRadius(Number(e.target.value)))
            }
            className="w-full accent-blue-500"
          />
        </div>
        <div className="flex gap-1">
          {RADIUS_PRESETS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onBorderRadiusChange(value)}
              className={`flex-1 rounded py-1.5 text-[11px] font-medium transition-colors ${
                borderRadius === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
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
  const modes: {
    label: string;
    desc: string;
    icon: string;
    value: boolean | null;
  }[] = [
    {
      label: 'روشن',
      desc: 'تم روشن به‌عنوان پیش‌فرض',
      icon: '☀️',
      value: false
    },
    {
      label: 'تاریک',
      desc: 'تم تاریک به‌عنوان پیش‌فرض',
      icon: '🌙',
      value: true
    },
    { label: 'هر دو', desc: 'کاربر انتخاب می‌کند', icon: '🌗', value: null }
  ];

  return (
    <AccordionSection title="حالت تم">
      <div className="space-y-2">
        {modes.map((mode) => (
          <button
            key={mode.label}
            type="button"
            onClick={() => onDarkModeChange(mode.value)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition-all ${
              darkMode === mode.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <span className="text-base">{mode.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-200">{mode.label}</p>
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

// ── Design Sizes ──────────────────────────────────────────────────────────────

const SPACING_OPTIONS: { label: string; value: SectionSpacing }[] = [
  { label: 'فشرده', value: 'compact' },
  { label: 'معمول', value: 'comfortable' },
  { label: 'باز', value: 'spacious' }
];
const WIDTH_OPTIONS: { label: string; value: ContainerWidth }[] = [
  { label: 'باریک', value: 'narrow' },
  { label: 'معمول', value: 'standard' },
  { label: 'عریض', value: 'wide' },
  { label: 'تمام', value: 'full' }
];
const HEADING_OPTIONS: { label: string; value: HeadingScale }[] = [
  { label: 'کوچک', value: 'compact' },
  { label: 'معمول', value: 'standard' },
  { label: 'بزرگ', value: 'large' }
];

function SizeRow<T extends string>({
  title,
  options,
  value,
  onChange
}: {
  title: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-zinc-400">{title}</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded py-1.5 text-[11px] font-medium transition-colors ${
              value === o.value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {o.label}
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
  return (
    <AccordionSection title="اندازه‌های طراحی">
      <div className="space-y-4">
        <SizeRow
          title="فاصله بخش‌ها"
          options={SPACING_OPTIONS}
          value={sectionSpacing}
          onChange={(v) => onChange({ section_spacing: v })}
        />
        <SizeRow
          title="عرض محتوا"
          options={WIDTH_OPTIONS}
          value={containerWidth}
          onChange={(v) => onChange({ container_width: v })}
        />
        <SizeRow
          title="اندازه عناوین"
          options={HEADING_OPTIONS}
          value={headingScale}
          onChange={(v) => onChange({ heading_scale: v })}
        />
      </div>
    </AccordionSection>
  );
}

// ── Banner Image ──────────────────────────────────────────────────────────────

function BannerImageSection({
  blocks,
  onBannerImageChange
}: {
  blocks: UIBlockConfig[];
  onBannerImageChange: (url: string) => void;
}) {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const heroBlock = blocks.find(
    (b) => b.type === 'hero' || b.type === 'slideshow'
  );
  const currentImage =
    (heroBlock?.config?.bgImage as string | undefined) ?? null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const result = await apiClient.uploadImage(file, {
        title: 'Banner Image'
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        onBannerImageChange(
          `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`
        );
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const applyUrl = () => {
    if (urlInput.trim()) {
      onBannerImageChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <AccordionSection title="تصویر بنر">
      <div className="space-y-3">
        {currentImage && (
          <div className="overflow-hidden rounded-lg border border-zinc-700">
            <img
              src={currentImage}
              alt="Banner"
              className="h-20 w-full object-cover"
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-600 py-2.5 text-xs text-zinc-400 transition-colors hover:border-blue-500 hover:text-blue-400"
        >
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? 'در حال آپلود...' : 'آپلود تصویر از دستگاه'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          title="آپلود تصویر بنر"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyUrl()}
            placeholder="...//https"
            className="h-8 flex-1 border-zinc-600 bg-zinc-800 text-right text-xs text-zinc-200 placeholder:text-zinc-600"
            dir="ltr"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="rounded-lg bg-blue-600 px-3 text-xs font-medium text-white transition-colors hover:bg-blue-700"
          >
            اعمال
          </button>
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] text-zinc-500">تصاویر نمونه</p>
          <div className="grid grid-cols-3 gap-1.5">
            {SAMPLE_BANNER_IMAGES.map((src, i) => (
              <button
                key={src}
                type="button"
                title={`تصویر نمونه ${i + 1}`}
                onClick={() => onBannerImageChange(src)}
                className="overflow-hidden rounded-lg border border-zinc-700 transition-all hover:scale-[1.03] hover:border-blue-500"
              >
                <img
                  src={src}
                  alt="sample banner"
                  className="h-12 w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AccordionSection>
  );
}

// ── Main Style Tab ────────────────────────────────────────────────────────────

export interface SidebarStyleTabProps {
  primaryColor: string;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  darkMode: boolean | null;
  sectionSpacing: SectionSpacing;
  containerWidth: ContainerWidth;
  headingScale: HeadingScale;
  blocks: UIBlockConfig[];
  onColorChange: (color: string) => void;
  onFontFamilyChange: (f: FontFamily) => void;
  onBorderRadiusChange: (r: BorderRadius) => void;
  onDarkModeChange: (mode: boolean | null) => void;
  onDesignSizeChange: (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => void;
  onBannerImageChange: (url: string) => void;
}

export function SidebarStyleTab({
  primaryColor,
  fontFamily,
  borderRadius,
  darkMode,
  sectionSpacing,
  containerWidth,
  headingScale,
  blocks,
  onColorChange,
  onFontFamilyChange,
  onBorderRadiusChange,
  onDarkModeChange,
  onDesignSizeChange,
  onBannerImageChange
}: SidebarStyleTabProps) {
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
      <RoundedCornersSection
        borderRadius={borderRadius}
        onBorderRadiusChange={onBorderRadiusChange}
      />
      <DesignSizeSection
        sectionSpacing={sectionSpacing}
        containerWidth={containerWidth}
        headingScale={headingScale}
        onChange={onDesignSizeChange}
      />
      <ThemeModeSection
        darkMode={darkMode}
        onDarkModeChange={onDarkModeChange}
      />
      <BannerImageSection
        blocks={blocks}
        onBannerImageChange={onBannerImageChange}
      />
    </div>
  );
}
