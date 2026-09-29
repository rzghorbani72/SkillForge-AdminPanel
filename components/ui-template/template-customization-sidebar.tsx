'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Globe, Palette, Layers, Copy, Wand2 } from 'lucide-react';
import type { UIBlockConfig } from '@/types/api';
import type {
  BorderRadius,
  ElementAnimation,
  Shadow,
  SectionSpacing,
  ContainerWidth,
  HeadingScale,
  FontFamily,
  TextDirection,
  SaveMode,
} from './sidebar-types';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useShowOnce } from '@/hooks/use-show-once';
import { SidebarStyleTab } from './sidebar-style-tab';
import { SidebarSectionsTab } from './sidebar-sections-tab';
import type { HeroPreviewContext } from './hero-variant-picker';

export type { SaveMode } from './sidebar-types';

type Tab = 'sections' | 'style';

export interface TemplateCustomizationSidebarProps {
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
  blocks: UIBlockConfig[];
  isSaving: boolean;
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
  onBlocksChange: (blocks: UIBlockConfig[]) => void;
  onUpdateBlock: (blockId: string, config: Record<string, unknown>) => void;
  onOpenPicker: (target?: { blockId: string; type: string }) => void;
  onPickBlockType?: (blockId: string, type: string) => void;
  onToggleVisibleBlock: (id: string, visible: boolean) => void;
  onDeleteBlock: (id: string) => void;
  onReset: () => void;
  /** True while a public original is selected and no copy exists yet. */
  isOriginalSelected?: boolean;
  templateId?: string;
  saveMode?: SaveMode;
  onClose: () => void;
  onCloseSection: () => void;
  selectedBlockId?: string | null;
  onSelectBlock: (blockId: string) => void;
  preview?: HeroPreviewContext | null;
  /** Real academy name, used as the live default for brand fields. */
  academyName?: string;
}

export function TemplateCustomizationSidebar({
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
  blocks,
  isSaving,
  onColorChange,
  onFontFamilyChange,
  onBorderRadiusChange,
  onShadowChange,
  onElementAnimationChange,
  onDarkModeChange,
  onTextDirectionChange,
  onDesignSizeChange,
  onBlocksChange,
  onUpdateBlock,
  onOpenPicker,
  onPickBlockType,
  onToggleVisibleBlock,
  onDeleteBlock,
  onReset,
  isOriginalSelected,
  templateId,
  saveMode,
  onClose,
  onCloseSection,
  selectedBlockId,
  onSelectBlock,
  preview,
  academyName,
}: TemplateCustomizationSidebarProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('style');
  const isAdminEditing = saveMode === 'admin-override';
  const { user } = useAuthUser();
  const showForkNotice = useShowOnce(
    `template_fork_notice:${user?.id}:${templateId}`,
    !isAdminEditing && !!isOriginalSelected && !!user?.id && !!templateId,
  );

  // The sidebar always opens on Appearance; only a fresh section pick in the
  // preview moves it to Sections, where that section's editor lives.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selectedBlockId) setTab('sections');
  }, [selectedBlockId]);

  const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
    { id: 'sections', label: t('sitePreview.tabSections'), icon: Layers },
    { id: 'style', label: t('sitePreview.panelTabStyle'), icon: Palette },
  ];

  return (
    <div
      className="flex h-full w-72 flex-shrink-0 flex-col border-l border-zinc-200 bg-white"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          {isAdminEditing ? (
            <Globe className="h-4 w-4 text-amber-600" />
          ) : (
            <Wand2 className="h-4 w-4 text-zinc-500" />
          )}
          <span className="text-sm font-semibold text-zinc-900">
            {isAdminEditing ? t('sitePreview.sidebarTitleAdmin') : t('sitePreview.sidebarTitle')}
          </span>
        </div>
        <button
          type="button"
          title={t('common.close')}
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Editing a catalog template forks it into the academy's own copy, so
          say that up front instead of letting the save surprise them. */}
      {showForkNotice && (
        <div className="flex items-start gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-[11px] leading-relaxed text-zinc-600">
          <Copy className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          {t('sitePreview.originalLockedBadge')}
        </div>
      )}

      {/* Master-template notice */}
      {isAdminEditing && (
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[11px] leading-relaxed text-amber-800">
          <Globe className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          {t('sitePreview.sidebarMasterNotice')}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex flex-shrink-0 gap-1 border-b border-zinc-200 px-3 py-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
              tab === id
                ? 'bg-zinc-200 text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-1.5 text-xs text-blue-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          {t('sitePreview.sidebarSaving')}
        </div>
      )}

      {/* Tab body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'sections' ? (
          <SidebarSectionsTab
            blocks={blocks}
            onBlocksChange={onBlocksChange}
            onOpenPicker={onOpenPicker}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
            onToggleVisibleBlock={onToggleVisibleBlock}
            onDeleteBlock={onDeleteBlock}
            onCloseSection={onCloseSection}
            onPickBlockType={onPickBlockType}
            preview={preview}
            academyName={academyName}
          />
        ) : (
          <SidebarStyleTab
            primaryColor={primaryColor}
            fontFamily={fontFamily}
            borderRadius={borderRadius}
            shadow={shadow}
            elementAnimation={elementAnimation}
            darkMode={darkMode}
            textDirection={textDirection}
            sectionSpacing={sectionSpacing}
            containerWidth={containerWidth}
            headingScale={headingScale}
            onColorChange={onColorChange}
            onFontFamilyChange={onFontFamilyChange}
            onBorderRadiusChange={onBorderRadiusChange}
            onShadowChange={onShadowChange}
            onElementAnimationChange={onElementAnimationChange}
            onDarkModeChange={onDarkModeChange}
            onTextDirectionChange={onTextDirectionChange}
            onDesignSizeChange={onDesignSizeChange}
          />
        )}
      </div>

      {/* Footer – destructive reset only; save/publish live in the top bar */}
      <div className="flex flex-shrink-0 justify-center border-t border-zinc-200 px-4 py-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t('sitePreview.resetToOriginal')}
        </button>
      </div>
    </div>
  );
}
