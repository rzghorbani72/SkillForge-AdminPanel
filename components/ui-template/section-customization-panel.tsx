'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { UIBlockConfig } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { getSectionSchema, isSectionIncomplete } from './section-schema';
import { type HeroPreviewContext } from './hero-variant-picker';
import { ADDABLE_SECTION_TYPES } from '@/lib/ui-template/addable-section-types';
import { TEMPLATE_KEYS, isVideoBannerHero } from '@/constants/template-names';
import { SectionEditorBody } from './section-customization-panel/section-editor-body';

function isGalleryHeroStyle(style: unknown): boolean {
  return typeof style === 'string' && (TEMPLATE_KEYS as readonly string[]).includes(style);
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
  preview,
}: SectionEditorProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!block) return null;

  const isPlaceholder = block.type === 'placeholder';
  const schema = getSectionSchema(block.type);
  const cfg = block.config ?? {};
  const set = (key: string, value: unknown) => onUpdate(block.id, { [key]: value });
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
        <span className="text-sm font-semibold text-zinc-900">{schema.name}</span>
        {incomplete && (
          <span
            title={t('sitePreview.panelIncomplete')}
            className="h-2 w-2 rounded-full bg-amber-400"
          />
        )}
      </div>

      <SectionEditorBody
        block={block}
        canDelete={canDelete}
        canMoveDown={canMoveDown}
        canMoveUp={canMoveUp}
        cfg={cfg}
        hasMediaFrame={hasMediaFrame}
        isGalleryHero={isGalleryHero}
        isPlaceholder={isPlaceholder}
        isVisible={isVisible}
        onDelete={onDelete}
        onMove={onMove}
        onPickBlockType={onPickBlockType}
        onToggleVisible={onToggleVisible}
        onUpdate={onUpdate}
        preview={preview}
        previousType={previousType}
        schema={schema}
        set={set}
        setAndReveal={setAndReveal}
        setShowAdvanced={setShowAdvanced}
        showAdvanced={showAdvanced}
      />
    </div>
  );
}
