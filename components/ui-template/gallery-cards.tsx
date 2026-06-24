'use client';

import { useState } from 'react';
import { Eye, Lock, Trash2, Check } from 'lucide-react';
import type { TemplatePreset } from '@/types/api';
import { getDesignSystem } from '@/lib/design-systems';
import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';
import { SectionPreviewFrame } from './section-preview-frame';

// Card/preview swatches follow the template's saved theme when present, so a
// dedicated template shows its real palette instead of the design-system default.
export function resolveTemplateColors(preset: TemplatePreset) {
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

export type TemplateCategory = 'minimal' | 'creative' | 'professional' | 'dark';

const CATEGORY_BY_ID: Record<string, TemplateCategory> = {
  flow: 'minimal',
  creative: 'creative',
  code: 'professional'
};

// PUBLIC presets map to a known catalog category; until the API returns one,
// derive it from the preset id. DEDICATED templates have no fixed category.
export function getTemplateCategory(preset: TemplatePreset): TemplateCategory {
  return CATEGORY_BY_ID[preset.id] ?? 'professional';
}

export const CATEGORY_LABELS: {
  value: TemplateCategory | 'all';
  label: string;
}[] = [
  { value: 'all', label: 'همه' },
  { value: 'minimal', label: 'مینیمال' },
  { value: 'creative', label: 'خلاق' },
  { value: 'professional', label: 'حرفه‌ای' },
  { value: 'dark', label: 'تاریک' }
];

interface TemplateSectionProps {
  title: string;
  description: string;
  presets: TemplatePreset[];
  activePresetId: string;
  onSelect: (preset: TemplatePreset) => void;
  onQuickApply?: (preset: TemplatePreset) => void;
  onDelete: (preset: TemplatePreset) => void;
}

export function TemplateSection({
  title,
  description,
  presets,
  activePresetId,
  onSelect,
  onQuickApply,
  onDelete
}: TemplateSectionProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {presets.map((preset, idx) => (
          <GalleryCard
            key={preset.id}
            preset={preset}
            isActive={preset.id === activePresetId}
            index={idx}
            onClick={() => onSelect(preset)}
            onQuickApply={onQuickApply ? () => onQuickApply(preset) : undefined}
            onDelete={preset.isOwned ? () => onDelete(preset) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

interface GalleryCardProps {
  preset: TemplatePreset;
  isActive: boolean;
  index: number;
  onClick: () => void;
  onQuickApply?: () => void;
  onDelete?: () => void;
}

function GalleryCard({
  preset,
  isActive,
  index,
  onClick,
  onQuickApply,
  onDelete
}: GalleryCardProps) {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const ds = getDesignSystem(preset.id);
  const isDedicated = preset.visibility === 'DEDICATED';
  const colors = resolveTemplateColors(preset);
  const swatches = [
    colors.background,
    colors.primary,
    colors.secondary,
    colors.accent
  ];
  // The cover is a real storefront render of the template, so no manual cover
  // upload is needed. The brand gradient shows as a placeholder until the iframe
  // finishes loading (and stays as the fallback if no storefront URL is set).
  const storefrontBaseUrl = resolveStorefrontBaseUrl();

  return (
    <div
      style={{ animationDelay: `${index * 55}ms` }}
      className={`group relative overflow-hidden rounded-2xl border text-right duration-300 animate-in fade-in slide-in-from-bottom-3 hover:-translate-y-1 ${
        isActive
          ? 'border-emerald-400/80 bg-background shadow-[0_0_0_1px_#34d39966,0_8px_32px_rgba(16,185,129,0.18)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.22)]'
          : 'border-border/50 bg-background shadow-sm hover:border-border hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.13)]'
      }`}
    >
      {isActive && (
        <div className="absolute inset-x-0 top-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      )}

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

      {/* Thumbnail */}
      <button
        type="button"
        onClick={onClick}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-muted/40"
      >
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-500 ${
            frameLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.secondary}cc 100%)`
          }}
        >
          <span className="px-6 text-center text-xl font-bold text-white drop-shadow-lg">
            {preset.name}
          </span>
          <div className="flex gap-1.5">
            {swatches.map((c, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full border border-white/40"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {storefrontBaseUrl && (
          <SectionPreviewFrame
            baseUrl={storefrontBaseUrl}
            templateKey={preset.id}
            onLoad={() => setFrameLoaded(true)}
            className={`h-full w-full transition-opacity duration-500 ${
              frameLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover overlay: full preview + quick apply */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/[0.52] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-zinc-900 shadow-sm">
            <Eye className="h-3.5 w-3.5" />
            پیش‌نمایش کامل
          </span>
          {onQuickApply && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onQuickApply();
              }}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-white/40 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Check className="h-3 w-3" />
              انتخاب سریع
            </span>
          )}
        </div>

        {isActive && (
          <span className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            فعال
          </span>
        )}
      </button>

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
    </div>
  );
}
