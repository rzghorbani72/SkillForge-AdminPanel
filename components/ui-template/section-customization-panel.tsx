'use client';

import { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  Upload,
  MousePointerClick,
  Info,
  Undo2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { UIBlockConfig } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { getSectionSchema, isSectionIncomplete } from './section-schema';
import { TextOverridesEditor } from './text-overrides-editor';
import { SectionSlotEditor } from './section-slot-editor';
import { isGridSection } from './slot-constants';
import {
  HeroVariantPicker,
  type HeroPreviewContext
} from './hero-variant-picker';
import { BlockTypePicker, blockTypeLabelKey } from './block-type-picker';
import { HeroVideoPicker } from './hero-video-picker';
import { SlidesEditor } from './slides-editor';
import { VideosEditor } from './videos-editor';
import { ADDABLE_SECTION_TYPES } from '@/lib/ui-template/addable-section-types';
import { HeroAlignPicker } from './hero-align-picker';
import {
  TEMPLATE_KEYS,
  isCenteredHero,
  isVideoBannerHero
} from '@/constants/template-names';

type HeroBgType = 'gradient' | 'solid' | 'image';

// Mirror of MEDIA_HEIGHT_BOUNDS / MEDIA_RATIOS in edusphere's hero-slideshow-slot.
const MEDIA_HEIGHT_MIN = 120;
const MEDIA_HEIGHT_MAX = 720;
const MEDIA_HEIGHT_DEFAULT = 260;
const MEDIA_RATIOS = [
  'free',
  '3:1',
  '21:9',
  '16:9',
  '4:3',
  '1:1',
  '9:16'
] as const;

function isGalleryHeroStyle(style: unknown): boolean {
  return (
    typeof style === 'string' &&
    (TEMPLATE_KEYS as readonly string[]).includes(style)
  );
}

export interface SectionEditorProps {
  block: UIBlockConfig | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
  onMove: (blockId: string, dir: 'up' | 'down') => void;
  onDelete: (blockId: string) => void;
  onToggleVisible: (blockId: string, visible: boolean) => void;
  onBack: () => void;
  onPickBlockType?: (blockId: string, type: string) => void;
  // Live-preview context for the hero design picker (null = picker hidden).
  preview?: HeroPreviewContext | null;
  /** Real academy name, used as the live default for brand fields. */
  academyName?: string;
}

// Section-specific editor — slim contextual panel when a block is selected.
// Canvas handles text/media; sidebar shows hero design + section actions only.
export function SectionEditor({
  block,
  canMoveUp,
  canMoveDown,
  canDelete,
  onUpdate,
  onMove,
  onDelete,
  onToggleVisible,
  onBack,
  onPickBlockType,
  preview
}: SectionEditorProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!block) return null;

  const isPlaceholder = block.type === 'placeholder';
  const schema = getSectionSchema(block.type);
  const cfg = block.config ?? {};
  const set = (key: string, value: unknown) =>
    onUpdate(block.id, { [key]: value });
  // Set by handleBlockDelete: what this slot used to be, so a shortcut can
  // skip straight to that type's design library instead of the full grid.
  const previousType =
    isPlaceholder &&
    typeof cfg.previousType === 'string' &&
    (ADDABLE_SECTION_TYPES as readonly string[]).includes(cfg.previousType)
      ? (cfg.previousType as string)
      : null;
  const incomplete = isSectionIncomplete(block.type, cfg);
  const isVisible = block.isVisible !== false;
  // Media sections ship hidden, because an empty carousel or video wall is
  // worse than no section. Adding the first item is the manager saying they
  // want it, so it turns itself on rather than needing a second toggle.
  const setAndReveal = (key: string, value: unknown) => {
    set(key, value);
    if (!isVisible && Array.isArray(value) && value.length > 0) {
      onToggleVisible(block.id, true);
    }
  };
  const isGalleryHero = block.type === 'hero' && isGalleryHeroStyle(cfg.style);
  const hasMediaFrame = isGalleryHero && !isVideoBannerHero(cfg.style);

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-zinc-200 px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('common.back')}
          title={t('common.back')}
          className="rounded-lg p-1 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-zinc-900">
          {schema.name}
        </span>
        {incomplete && (
          <span
            title={t('sitePreview.panelIncomplete')}
            className="h-2 w-2 rounded-full bg-amber-400"
          />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {isPlaceholder ? (
          <>
            <p className="text-xs leading-relaxed text-zinc-600">
              {t('sitePreview.emptySlotHint')}
            </p>
            {onPickBlockType && previousType && (
              <button
                type="button"
                onClick={() => onPickBlockType(block.id, previousType)}
                className="mt-3 flex w-full items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-right text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
              >
                <Undo2 className="h-3.5 w-3.5 shrink-0" />
                {t('sitePreview.revertToPrevious', {
                  type: t(blockTypeLabelKey(previousType)) || previousType
                })}
              </button>
            )}
            {onPickBlockType && (
              <BlockTypePicker
                onSelect={(type) => onPickBlockType(block.id, type)}
              />
            )}
          </>
        ) : (
          <>
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
              <MousePointerClick className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <p className="text-[11px] leading-relaxed text-blue-700">
                {t('sitePreview.canvasEditHint')}
              </p>
            </div>

            {block.type === 'hero' && preview && (
              <div className="mt-4 border-b border-zinc-200/70 pb-4">
                <HeroVariantPicker
                  heroBlockId={block.id}
                  value={(cfg.style as string) ?? TEMPLATE_KEYS[0]}
                  onChange={(style) => set('style', style)}
                  preview={preview}
                />
              </div>
            )}

            {isGalleryHero && (
              <div className="mt-4 space-y-3 border-b border-zinc-200/70 pb-4">
                {hasMediaFrame && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      {t('sitePreview.panelMediaRatio')}
                    </span>
                    <div className="grid grid-cols-4 gap-1.5" dir="ltr">
                      {MEDIA_RATIOS.map((ratio) => {
                        const current =
                          typeof cfg.mediaRatio === 'string'
                            ? cfg.mediaRatio
                            : 'free';
                        return (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => set('mediaRatio', ratio)}
                            className={`rounded border py-1.5 text-[11px] font-medium transition-colors ${
                              current === ratio
                                ? 'border-blue-500 bg-blue-600 text-white'
                                : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            {ratio === 'free'
                              ? t('sitePreview.panelRatioFree')
                              : ratio}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <HeroVideoPicker
                  cfg={cfg}
                  set={set}
                  onUpdate={(config) => onUpdate(block.id, config)}
                  alwaysAutoplay={isVideoBannerHero(cfg.style)}
                />

                {isCenteredHero(cfg.style) && (
                  <HeroAlignPicker
                    value={cfg.textAlign}
                    onChange={(align) => set('textAlign', align)}
                  />
                )}

                {hasMediaFrame && (cfg.mediaRatio ?? 'free') === 'free' && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">
                        {t('sitePreview.panelMediaHeight')}
                      </span>
                      <span className="text-xs text-zinc-700">
                        {(cfg.mediaHeight as number) ?? MEDIA_HEIGHT_DEFAULT}px
                      </span>
                    </div>
                    <input
                      type="range"
                      title={t('sitePreview.panelMediaHeight')}
                      min={MEDIA_HEIGHT_MIN}
                      max={MEDIA_HEIGHT_MAX}
                      step={10}
                      value={
                        (cfg.mediaHeight as number) ?? MEDIA_HEIGHT_DEFAULT
                      }
                      onChange={(e) =>
                        set('mediaHeight', Number(e.target.value))
                      }
                      className="mt-1.5 w-full accent-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {block.type === 'slideshow' && (
              <div className="mt-4 border-t border-zinc-200/70 pt-4">
                <SlidesEditor cfg={cfg} set={setAndReveal} />
              </div>
            )}

            {block.type === 'videos' && (
              <div className="mt-4 border-t border-zinc-200/70 pt-4">
                <VideosEditor cfg={cfg} set={setAndReveal} />
              </div>
            )}

            {canDelete && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <span className="flex items-center gap-2 text-xs text-zinc-700">
                  <Eye className="h-3.5 w-3.5" />
                  {t('sitePreview.panelSectionVisible')}
                </span>
                <Switch
                  checked={isVisible}
                  onCheckedChange={(v) => onToggleVisible(block.id, v)}
                />
              </div>
            )}

            {isGridSection(block.type) && (
              <div className="mt-4 border-t border-zinc-200/70 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex w-full items-center justify-between text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  <span>{t('sitePreview.panelAdvanced')}</span>
                  {showAdvanced ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                {showAdvanced && (
                  <div className="mt-3 space-y-4">
                    <TextOverridesEditor
                      blockType={block.type}
                      cfg={cfg}
                      set={set}
                    />
                    <SectionSlotEditor
                      blockType={block.type}
                      cfg={cfg}
                      set={set}
                    />
                  </div>
                )}
              </div>
            )}

            {!isGalleryHero &&
              schema.hasBackground &&
              block.type !== 'hero' && (
                <div className="mt-4 border-t border-zinc-200/70 pt-4">
                  <HeroBackground
                    block={block}
                    cfg={cfg}
                    set={set}
                    onUpdate={onUpdate}
                  />
                </div>
              )}

            {schema.dynamicContentNote && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-400/20 bg-blue-400/5 px-3 py-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  {schema.dynamicContentNote}
                </p>
              </div>
            )}
          </>
        )}

        <div className="mt-3 space-y-1.5">
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={() => onMove(block.id, 'up')}
              className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-300 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              {t('settings.moveUp')}
            </button>
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={() => onMove(block.id, 'down')}
              className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-300 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              {t('settings.moveDown')}
            </button>
          </div>
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(block.id)}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-red-500/30 bg-red-600/10 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isPlaceholder
                ? t('sitePreview.removeEmptySlot')
                : t('sitePreview.panelDeleteSection')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Legacy hero background (non-gallery heroes only) ─────────────────────────

function HeroBackground({
  block,
  cfg,
  set,
  onUpdate
}: {
  block: UIBlockConfig;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const bgType: HeroBgType = (cfg.bgType as HeroBgType) ?? 'gradient';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const result = await apiClient.uploadImage(file, {
        title: 'Hero Background'
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
        onUpdate(block.id, {
          bgImage: url,
          backgroundImage: url,
          bgType: 'image'
        });
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const bgOptions: { type: HeroBgType; label: string }[] = [
    { type: 'gradient', label: t('sitePreview.panelBgGradient') },
    { type: 'solid', label: t('sitePreview.panelBgSolid') },
    { type: 'image', label: t('sitePreview.panelBgImage') }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {t('sitePreview.panelBackground')}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {bgOptions.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                // When switching to solid without an existing color, default
                // to the primary blue so the preview immediately shows solid.
                if (type === 'solid' && !cfg.bgColor) {
                  onUpdate(block.id, {
                    bgType: 'solid',
                    bgColor: '#3b82f6'
                  });
                } else {
                  set('bgType', type);
                }
              }}
              className={`rounded border py-1.5 text-xs font-medium transition-colors ${
                bgType === type
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {bgType === 'solid' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            title={t('sitePreview.panelBackground')}
            value={(cfg.bgColor as string) ?? '#3b82f6'}
            onChange={(e) => set('bgColor', e.target.value)}
            className="h-8 w-9 shrink-0 cursor-pointer rounded border border-zinc-300 bg-transparent"
          />
          <Input
            value={(cfg.bgColor as string) ?? '#3b82f6'}
            onChange={(e) => set('bgColor', e.target.value)}
            className="h-8 border-zinc-300 bg-zinc-100 font-mono text-xs text-zinc-900"
            placeholder="#3b82f6"
          />
        </div>
      )}

      {bgType === 'image' && (
        <div className="space-y-2">
          {cfg.bgImage ? (
            <div className="group relative overflow-hidden rounded-md border border-zinc-200">
              <img
                src={cfg.bgImage as string}
                alt="Hero background"
                className="h-20 w-full object-cover"
              />
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="ml-1 h-3.5 w-3.5" />
                {t('sitePreview.panelReplaceImage')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 py-4 text-xs text-zinc-600 transition-colors hover:border-blue-500 hover:text-blue-400">
              <Upload className="h-4 w-4" />
              {isUploading
                ? t('sitePreview.panelUploading')
                : t('sitePreview.panelUploadImage')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          )}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600">
                {t('sitePreview.panelOverlayOpacity')}
              </span>
              <span className="text-xs text-zinc-700">
                {(cfg.overlayOpacity as number) ?? 40}%
              </span>
            </div>
            <input
              type="range"
              title={t('sitePreview.panelOverlayOpacity')}
              min={0}
              max={80}
              value={(cfg.overlayOpacity as number) ?? 40}
              onChange={(e) => set('overlayOpacity', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
