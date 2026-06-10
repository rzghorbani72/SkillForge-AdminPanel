'use client';

import { useState, useRef } from 'react';
import {
  X,
  RotateCcw,
  Upload,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ArrowLeftRight,
  Lock,
  Plus,
  Save
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { hexToHsl, hslToHex } from '@/lib/design-system-palette';
import type { UIBlockConfig } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';

type BorderRadius = 'sharp' | 'soft' | 'rounded';
type Shadow = 'none' | 'subtle' | 'medium' | 'strong';

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
  { label: 'کم', value: 'sharp' },
  { label: 'معمول', value: 'soft' },
  { label: 'گرد', value: 'rounded' },
  { label: 'بیضی', value: 'rounded' }
];

const RADIUS_PX: Record<BorderRadius, number> = {
  sharp: 2,
  soft: 8,
  rounded: 16
};

const BLOCK_LABELS: Record<string, string> = {
  header: 'ناوبری',
  hero: 'هیرو',
  features: 'دسته‌بندی‌ها',
  courses: 'دوره‌ها',
  testimonials: 'نظرات',
  slideshow: 'اسلایدشو',
  footer: 'فوتر',
  sidebar: 'سایدبار'
};

const SAMPLE_BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&q=70',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=70',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=70',
  'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400&q=70',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&q=70',
  'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&q=70'
];

const BLOCK_TAG: Record<string, string> = {
  header: 'nav',
  hero: 'section',
  features: 'section',
  courses: 'section',
  testimonials: 'section',
  slideshow: 'section',
  footer: 'div',
  sidebar: 'div'
};

export interface TemplateCustomizationSidebarProps {
  primaryColor: string;
  borderRadius: BorderRadius;
  shadow: Shadow;
  darkMode: boolean | null;
  sectionSpacing: SectionSpacing;
  containerWidth: ContainerWidth;
  headingScale: HeadingScale;
  blocks: UIBlockConfig[];
  isSaving: boolean;
  onColorChange: (color: string) => void;
  onBorderRadiusChange: (r: BorderRadius) => void;
  onDarkModeChange: (mode: boolean | null) => void;
  onDesignSizeChange: (patch: {
    section_spacing?: SectionSpacing;
    container_width?: ContainerWidth;
    heading_scale?: HeadingScale;
  }) => void;
  onBlocksChange: (blocks: UIBlockConfig[]) => void;
  onBannerImageChange: (url: string) => void;
  onOpenPicker: (target?: { blockId: string; type: string }) => void;
  onReset: () => void;
  onSaveAsTemplate?: () => void;
  onClose: () => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
}

// ── Accordion ────────────────────────────────────────────────────────────────

function AccordionSection({
  title,
  defaultOpen = false,
  children
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-700/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-right text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/60"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

// ── Brand Color ───────────────────────────────────────────────────────────────

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
          <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-zinc-600 px-1.5 py-1">
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-sm" />
            <span className="h-3.5 w-3.5 rounded-full bg-zinc-900 shadow-sm" />
          </div>
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

// ── Rounded Corners ───────────────────────────────────────────────────────────

function RoundedCornersSection({
  borderRadius,
  onBorderRadiusChange
}: {
  borderRadius: BorderRadius;
  onBorderRadiusChange: (r: BorderRadius) => void;
}) {
  const cardPx = RADIUS_PX[borderRadius];
  const btnPx = borderRadius === 'rounded' ? 100 : RADIUS_PX[borderRadius];

  const cardToRadius = (px: number): BorderRadius =>
    px <= 3 ? 'sharp' : px <= 12 ? 'soft' : 'rounded';

  const btnToRadius = (px: number): BorderRadius =>
    px <= 4 ? 'sharp' : px <= 20 ? 'soft' : 'rounded';

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">شعاع دکمه‌ها</span>
            <span className="font-mono text-xs text-zinc-300">{btnPx}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={btnPx}
            title="شعاع دکمه‌ها"
            onChange={(e) =>
              onBorderRadiusChange(btnToRadius(Number(e.target.value)))
            }
            className="w-full accent-blue-500"
          />
        </div>

        <div className="flex gap-1">
          {RADIUS_PRESETS.map(({ label, value }) => (
            <button
              key={label}
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
    { label: 'هر دو', desc: 'کاربر انتخاب می‌کند', icon: '🌙', value: null }
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

// ── Design System Sizes ───────────────────────────────────────────────────────

type SectionSpacing = 'compact' | 'comfortable' | 'spacious';
type ContainerWidth = 'narrow' | 'standard' | 'wide' | 'full';
type HeadingScale = 'compact' | 'standard' | 'large';

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

// ── Section Order ─────────────────────────────────────────────────────────────

// Header is always pinned first, footer always pinned last — neither can be
// dragged or removed. Everything in between is drag-reorderable.
function PinnedRow({
  block,
  isSelected,
  onSelect,
  onReplace
}: {
  block: UIBlockConfig;
  isSelected: boolean;
  onSelect?: () => void;
  onReplace: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
        isSelected
          ? 'border-blue-500/60 bg-blue-500/10'
          : 'border-zinc-700/60 bg-zinc-800/30'
      }`}
    >
      <Lock className="h-3 w-3 flex-shrink-0 text-zinc-600" />
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-right text-xs text-zinc-300 hover:text-zinc-100"
      >
        {BLOCK_LABELS[block.type] ?? block.type}
      </button>
      <button
        type="button"
        title="جایگزینی بخش"
        onClick={onReplace}
        className="text-zinc-500 transition-colors hover:text-zinc-200"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SortableRow({
  block,
  isSelected,
  onSelect,
  onReplace
}: {
  block: UIBlockConfig;
  isSelected: boolean;
  onSelect?: () => void;
  onReplace: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
        isSelected
          ? 'border-blue-500/60 bg-blue-500/10'
          : 'border-transparent bg-zinc-800/60'
      } ${isDragging ? 'opacity-60' : ''}`}
    >
      <button
        type="button"
        title="جابه‌جایی"
        className="cursor-grab text-zinc-500 transition-colors hover:text-zinc-200 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-right text-xs text-zinc-300 hover:text-zinc-100"
      >
        {BLOCK_LABELS[block.type] ?? block.type}
      </button>
      <span className="rounded bg-zinc-700 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
        {BLOCK_TAG[block.type] ?? 'div'}
      </span>
      <button
        type="button"
        title="جایگزینی بخش"
        onClick={onReplace}
        className="text-zinc-500 transition-colors hover:text-zinc-200"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SectionOrderSection({
  blocks,
  onBlocksChange,
  onOpenPicker,
  selectedBlockId,
  onSelectBlock
}: {
  blocks: UIBlockConfig[];
  onBlocksChange: (blocks: UIBlockConfig[]) => void;
  onOpenPicker: (target?: { blockId: string; type: string }) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  const header = sorted.find((b) => b.type === 'header') ?? null;
  const footer = sorted.find((b) => b.type === 'footer') ?? null;
  const middle = sorted.filter(
    (b) => b.type !== 'header' && b.type !== 'footer'
  );

  const reorder = (next: UIBlockConfig[]) => {
    const ordered = [
      ...(header ? [header] : []),
      ...next,
      ...(footer ? [footer] : [])
    ].map((block, index) => ({ ...block, order: index + 1 }));
    onBlocksChange(ordered);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = middle.findIndex((b) => b.id === active.id);
    const to = middle.findIndex((b) => b.id === over.id);
    if (from === -1 || to === -1) return;
    reorder(arrayMove(middle, from, to));
  };

  const replace = (block: UIBlockConfig) => () =>
    onOpenPicker({ blockId: block.id, type: block.type });
  const select = (block: UIBlockConfig) => () => onSelectBlock?.(block.id);

  return (
    <AccordionSection title="ترتیب و ترکیب بخش‌ها" defaultOpen>
      <div className="space-y-1">
        {header && (
          <PinnedRow
            block={header}
            isSelected={selectedBlockId === header.id}
            onSelect={select(header)}
            onReplace={replace(header)}
          />
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={middle.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {middle.map((block) => (
                <SortableRow
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={select(block)}
                  onReplace={replace(block)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {footer && (
          <PinnedRow
            block={footer}
            isSelected={selectedBlockId === footer.id}
            onSelect={select(footer)}
            onReplace={replace(footer)}
          />
        )}

        <button
          type="button"
          onClick={() => onOpenPicker()}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-600 py-2 text-xs text-zinc-400 transition-colors hover:border-blue-500 hover:text-blue-400"
        >
          <Plus className="h-3.5 w-3.5" />
          افزودن بخش
        </button>
      </div>
    </AccordionSection>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export function TemplateCustomizationSidebar({
  primaryColor,
  borderRadius,
  shadow: _shadow,
  darkMode,
  sectionSpacing,
  containerWidth,
  headingScale,
  blocks,
  isSaving,
  onColorChange,
  onBorderRadiusChange,
  onDarkModeChange,
  onDesignSizeChange,
  onBlocksChange,
  onBannerImageChange,
  onOpenPicker,
  onReset,
  onSaveAsTemplate,
  onClose,
  selectedBlockId,
  onSelectBlock
}: TemplateCustomizationSidebarProps) {
  return (
    <div
      className="flex h-full w-60 flex-shrink-0 flex-col border-l border-zinc-700 bg-zinc-900"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <span className="text-sm font-semibold text-zinc-100">
            سفارشی‌سازی قالب
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 bg-blue-900/40 px-4 py-1.5 text-xs text-blue-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
          در حال ذخیره...
        </div>
      )}

      {/* Accordion sections */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <BrandColorSection
          primaryColor={primaryColor}
          onColorChange={onColorChange}
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
        <SectionOrderSection
          blocks={blocks}
          onBlocksChange={onBlocksChange}
          onOpenPicker={onOpenPicker}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
        />
      </div>

      {/* Footer – save as dedicated template + reset */}
      <div className="flex-shrink-0 space-y-2 border-t border-zinc-700 p-4">
        {onSaveAsTemplate && (
          <button
            type="button"
            onClick={onSaveAsTemplate}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-600/10 py-2.5 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-600/20"
          >
            <Save className="h-4 w-4" />
            ذخیره به‌عنوان قالب اختصاصی
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-600/10 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-600/20"
        >
          <RotateCcw className="h-4 w-4" />
          بازنشانی همه تغییرات
        </button>
      </div>
    </div>
  );
}
