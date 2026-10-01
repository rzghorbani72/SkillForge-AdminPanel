'use client';

import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  MousePointerClick,
  Info,
  Undo2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { TextOverridesEditor } from '../text-overrides-editor';
import { SectionSlotEditor } from '../section-slot-editor';
import { isGridSection } from '../slot-constants';
import { HeroVariantPicker, type HeroPreviewContext } from '../hero-variant-picker';
import { BlockTypePicker, blockTypeLabelKey } from '../block-type-picker';
import { HeroVideoPicker } from '../hero-video-picker';
import { SlidesEditor } from '../slides-editor';
import { VideosEditor } from '../videos-editor';
import { HeroAlignPicker } from '../hero-align-picker';
import { TEMPLATE_KEYS, isCenteredHero, isVideoBannerHero } from '@/constants/template-names';
import type { Dispatch, SetStateAction } from 'react';
import {
  MEDIA_HEIGHT_MIN,
  MEDIA_HEIGHT_MAX,
  MEDIA_HEIGHT_DEFAULT,
  MEDIA_RATIOS,
  HeroBackground,
} from '../_lib/section-customization-panel-helpers';
import { SectionSchema } from '@/components/ui-template/section-schema';

export function SectionEditorBody({
  block,
  canDelete,
  canMoveDown,
  canMoveUp,
  cfg,
  hasMediaFrame,
  isGalleryHero,
  isPlaceholder,
  isVisible,
  onDelete,
  onMove,
  onPickBlockType,
  onToggleVisible,
  onUpdate,
  preview,
  previousType,
  schema,
  set,
  setAndReveal,
  setShowAdvanced,
  showAdvanced,
}: {
  block: UIBlockConfig;
  canDelete: boolean;
  canMoveDown: boolean;
  canMoveUp: boolean;
  cfg: Record<string, any>;
  hasMediaFrame: boolean;
  isGalleryHero: boolean;
  isPlaceholder: boolean;
  isVisible: boolean;
  onDelete: (blockId: string) => void;
  onMove: (blockId: string, dir: 'up' | 'down') => void;
  onPickBlockType: ((blockId: string, type: string) => void) | undefined;
  onToggleVisible: (blockId: string, visible: boolean) => void;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
  preview: HeroPreviewContext | null | undefined;
  previousType: string | null;
  schema: SectionSchema;
  set: (key: string, value: unknown) => void;
  setAndReveal: (key: string, value: unknown) => void;
  setShowAdvanced: Dispatch<SetStateAction<boolean>>;
  showAdvanced: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      {isPlaceholder ? (
        <>
          <p className="text-xs leading-relaxed text-zinc-600">{t('sitePreview.emptySlotHint')}</p>
          {onPickBlockType && previousType && (
            <button
              type="button"
              onClick={() => onPickBlockType(block.id, previousType)}
              className="mt-3 flex w-full items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-right text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Undo2 className="h-3.5 w-3.5 shrink-0" />
              {t('sitePreview.revertToPrevious', {
                type: t(blockTypeLabelKey(previousType)) || previousType,
              })}
            </button>
          )}
          {onPickBlockType && (
            <BlockTypePicker onSelect={(type) => onPickBlockType(block.id, type)} />
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
                      const current = typeof cfg.mediaRatio === 'string' ? cfg.mediaRatio : 'free';
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
                          {ratio === 'free' ? t('sitePreview.panelRatioFree') : ratio}
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
                    value={(cfg.mediaHeight as number) ?? MEDIA_HEIGHT_DEFAULT}
                    onChange={(e) => set('mediaHeight', Number(e.target.value))}
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
              <Switch checked={isVisible} onCheckedChange={(v) => onToggleVisible(block.id, v)} />
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
                  <TextOverridesEditor blockType={block.type} cfg={cfg} set={set} />
                  <SectionSlotEditor blockType={block.type} cfg={cfg} set={set} />
                </div>
              )}
            </div>
          )}

          {!isGalleryHero && schema.hasBackground && block.type !== 'hero' && (
            <div className="mt-4 border-t border-zinc-200/70 pt-4">
              <HeroBackground block={block} cfg={cfg} set={set} onUpdate={onUpdate} />
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
            {isPlaceholder ? t('sitePreview.removeEmptySlot') : t('sitePreview.panelDeleteSection')}
          </button>
        )}
      </div>
    </div>
  );
}
