'use client';

import { useRef, useState } from 'react';
import { Eye, Trash2, Check, Pencil, ImageUp, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TemplatePreset } from '@/types/api';
import { presetSourceKey } from '@/lib/ui-template/preset-source';
import { getDesignSystem } from '@/lib/design-systems';
import { apiClient } from '@/lib/api';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin } from '@/lib/roles';
import { SectionPreviewFrame } from './section-preview-frame';
import {
  getTemplateCategoryByKey,
  type TemplateCategory
} from '@/constants/template-names';
import { TemplateStarRating } from './template-star-rating';

// Card/preview swatches follow the template's saved theme when present, so a
// dedicated template shows its real palette instead of the design-system default.
export function resolveTemplateColors(preset: TemplatePreset) {
  const ds = getDesignSystem(presetSourceKey(preset));
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

// PUBLIC presets map to a known catalog category; until the API returns one,
// derive it from the preset id. DEDICATED templates have no fixed category.
export function getTemplateCategory(preset: TemplatePreset): TemplateCategory {
  return getTemplateCategoryByKey(presetSourceKey(preset));
}

interface TemplateSectionProps {
  title: string;
  description: string;
  presets: TemplatePreset[];
  activePresetId: string;
  previewToken?: string | null;
  storefrontBaseUrl?: string | null;
  /** Loading placeholder for a customized card: the base template's own banner. */
  getBaseCover?: (preset: TemplatePreset) => string | null | undefined;
  onSelect: (preset: TemplatePreset) => void;
  onQuickApply?: (preset: TemplatePreset) => void;
  onDelete: (preset: TemplatePreset) => void;
  /** Stars reorder the gallery, so rating refetches the list. */
  onRate?: (preset: TemplatePreset, stars: number | null) => void;
  /** Platform staff only: persists the uploaded banner and updates the list. */
  onCoverUploaded?: (preset: TemplatePreset, url: string) => void;
}

export function TemplateSection({
  title,
  description,
  presets,
  activePresetId,
  previewToken,
  storefrontBaseUrl,
  getBaseCover,
  onSelect,
  onQuickApply,
  onDelete,
  onRate,
  onCoverUploaded
}: TemplateSectionProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {presets.map((preset, idx) => (
          <GalleryCard
            key={preset.id}
            preset={preset}
            isActive={preset.id === activePresetId}
            index={idx}
            previewToken={previewToken}
            storefrontBaseUrl={storefrontBaseUrl}
            baseCoverUrl={getBaseCover?.(preset)}
            onClick={() => onSelect(preset)}
            onQuickApply={onQuickApply ? () => onQuickApply(preset) : undefined}
            onDelete={preset.isOwned ? () => onDelete(preset) : undefined}
            onRate={onRate ? (stars) => onRate(preset, stars) : undefined}
            onCoverUploaded={
              onCoverUploaded
                ? (url) => onCoverUploaded(preset, url)
                : undefined
            }
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
  previewToken?: string | null;
  storefrontBaseUrl?: string | null;
  baseCoverUrl?: string | null;
  onClick: () => void;
  onQuickApply?: () => void;
  onDelete?: () => void;
  onRate?: (stars: number | null) => void;
  onCoverUploaded?: (url: string) => void;
}

function GalleryCard({
  preset,
  isActive,
  index,
  previewToken,
  storefrontBaseUrl,
  baseCoverUrl,
  onClick,
  onQuickApply,
  onDelete,
  onRate,
  onCoverUploaded
}: GalleryCardProps) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const ds = getDesignSystem(presetSourceKey(preset));
  const isDedicated = preset.visibility === 'DEDICATED';
  // Every academy-owned template is a customized copy, whether or not it still
  // records the original it came from — one badge, one word for the manager.
  const isCustomized = isDedicated && !!preset.sourcePresetKey;
  const colors = resolveTemplateColors(preset);
  const swatches = [
    colors.background,
    colors.primary,
    colors.secondary,
    colors.accent
  ];
  // Only platform staff can set the banner shown for a shared catalog
  // template; a dedicated (academy-owned) copy has no such banner.
  const canUploadCover =
    !isDedicated && Boolean(onCoverUploaded) && isPlatformAdmin(user);
  // A static banner can't show a manager's own edits, so only a customized
  // card renders the real live storefront. Every other card (public, or a
  // dedicated copy with no changes recorded) is banner-or-gradient only.
  const canRenderFrame =
    isCustomized && Boolean(storefrontBaseUrl) && Boolean(previewToken);
  // Loading placeholder: this card's own banner if staff/manager set one,
  // otherwise the base template's banner, otherwise the brand gradient.
  const loadingCover = preset.preview ?? baseCoverUrl ?? null;

  const handleCoverFile = async (file: File) => {
    setIsUploadingCover(true);
    try {
      const uploaded = (await apiClient.uploadImage(file, {
        title: `${preset.name} banner`
      })) as { id?: string | number } | null;
      const id = uploaded?.id;
      if (id === undefined || id === null) return;
      const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
      await apiClient.setTemplateCover(preset.id, url);
      onCoverUploaded?.(url);
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div
      style={{ animationDelay: `${index * 55}ms` }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-right transition-[transform,box-shadow,border-color] duration-200 animate-in fade-in slide-in-from-bottom-3 hover:-translate-y-1 ${
        isActive
          ? 'border-emerald-500/70 shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_10px_30px_-12px_rgba(16,185,129,0.35)]'
          : 'border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-border hover:shadow-[0_14px_32px_-14px_rgba(0,0,0,0.22)]'
      }`}
    >
      {isActive && (
        <div className="absolute inset-x-0 top-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      )}

      {/* Dedicated badge + owner delete */}
      <div className="absolute start-2.5 top-2.5 z-20 flex items-center gap-1.5">
        {isDedicated && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <Pencil className="h-2.5 w-2.5" />
            {t('sitePreview.customizedBadge')}
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
        className="relative block aspect-[16/9] w-full overflow-hidden border-b border-border/50 bg-muted/30"
      >
        {canRenderFrame ? (
          <>
            {loadingCover ? (
              <img
                src={loadingCover}
                alt={preset.name}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  frameLoaded ? 'opacity-0' : 'opacity-100'
                }`}
              />
            ) : (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-500 ${
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
            )}
            <SectionPreviewFrame
              baseUrl={storefrontBaseUrl!}
              templateKey={preset.id}
              token={previewToken ?? undefined}
              onLoad={() => setFrameLoaded(true)}
              className={`h-full w-full transition-opacity duration-500 ${
                frameLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : preset.preview ? (
          // A staff-uploaded banner — object-cover keeps its own aspect ratio
          // intact (no stretching), cropping only what overflows the box.
          <img
            src={preset.preview}
            alt={preset.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
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
        )}

        {canUploadCover && (
          <span
            role="button"
            tabIndex={0}
            title="بارگذاری بنر قالب"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute bottom-2.5 end-2.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-black/75"
          >
            {isUploadingCover ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageUp className="h-3.5 w-3.5" />
            )}
            بنر
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) void handleCoverFile(file);
              }}
            />
          </span>
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
          <span className="absolute end-2.5 top-2.5 z-10 flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            فعال
          </span>
        )}
      </button>

      {/* Footer */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold leading-tight text-foreground">
            {preset.name}
          </h3>
          {/* Palette strip doubles as the at-a-glance identity of the template. */}
          <div className="flex flex-shrink-0 gap-1 rounded-full border border-border/60 bg-muted/40 p-1">
            {swatches.map((c, i) => (
              <span
                key={i}
                className="h-3 w-3 flex-shrink-0 rounded-full border border-black/10"
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

        {onRate && (
          <div className="pt-0.5">
            <TemplateStarRating
              rating={preset.rating ?? 0}
              ratingCount={preset.ratingCount ?? 0}
              myRating={preset.myRating ?? null}
              onRate={(stars) => onRate(stars)}
              onClear={() => onRate(null)}
            />
          </div>
        )}

        {(!isDedicated || isCustomized) && ds.tagline && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {ds.tagline.split('·').map((tag) => (
              <span
                key={tag}
                className="whitespace-nowrap rounded-md px-2 py-1 text-[10.5px] font-semibold"
                style={{
                  background: `${colors.primary}14`,
                  color: colors.primary
                }}
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
