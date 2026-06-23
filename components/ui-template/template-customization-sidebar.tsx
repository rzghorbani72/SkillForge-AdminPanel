'use client';

import { useState } from 'react';
import { X, RotateCcw, Save, Globe, Palette, Layers } from 'lucide-react';
import type { UIBlockConfig } from '@/types/api';
import type {
  BorderRadius,
  Shadow,
  SectionSpacing,
  ContainerWidth,
  HeadingScale,
  FontFamily,
  SaveMode
} from './sidebar-types';
import { CoverImageSection } from './sidebar-primitives';
import { SidebarStyleTab } from './sidebar-style-tab';
import { SidebarSectionsTab } from './sidebar-sections-tab';

export type { SaveMode } from './sidebar-types';

type Tab = 'sections' | 'style';

export interface TemplateCustomizationSidebarProps {
  primaryColor: string;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  shadow: Shadow;
  darkMode: boolean | null;
  sectionSpacing: SectionSpacing;
  containerWidth: ContainerWidth;
  headingScale: HeadingScale;
  blocks: UIBlockConfig[];
  isSaving: boolean;
  onColorChange: (color: string) => void;
  onFontFamilyChange: (f: FontFamily) => void;
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
  saveMode?: SaveMode;
  onSaveAsCopy?: () => void;
  onSaveOverride?: () => void;
  onClose: () => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
  coverImage?: string | null;
  onCoverImageChange?: (url: string) => void;
}

export function TemplateCustomizationSidebar({
  primaryColor,
  fontFamily,
  borderRadius,
  shadow: _shadow,
  darkMode,
  sectionSpacing,
  containerWidth,
  headingScale,
  blocks,
  isSaving,
  onColorChange,
  onFontFamilyChange,
  onBorderRadiusChange,
  onDarkModeChange,
  onDesignSizeChange,
  onBlocksChange,
  onBannerImageChange,
  onOpenPicker,
  onReset,
  saveMode,
  onSaveAsCopy,
  onSaveOverride,
  onClose,
  selectedBlockId,
  onSelectBlock,
  coverImage,
  onCoverImageChange
}: TemplateCustomizationSidebarProps) {
  const [tab, setTab] = useState<Tab>('sections');
  const isAdminEditing = saveMode === 'both' || saveMode === 'admin-override';

  const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
    { id: 'sections', label: 'بخش‌ها', icon: Layers },
    { id: 'style', label: 'ظاهر', icon: Palette }
  ];

  return (
    <div
      className="flex h-full w-72 flex-shrink-0 flex-col border-l border-zinc-700 bg-zinc-900"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{isAdminEditing ? '🌐' : '🤖'}</span>
          <span className="text-sm font-semibold text-zinc-100">
            {isAdminEditing ? 'ویرایش قالب عمومی' : 'سفارشی‌سازی قالب'}
          </span>
        </div>
        <button
          type="button"
          title="بستن"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Master-template notice */}
      {saveMode === 'both' && (
        <div className="flex items-start gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-[11px] leading-relaxed text-amber-300">
          <Globe className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          این قالب اصلی است؛ ذخیره، نسخهٔ پایه همه مدیران را به‌روز می‌کند
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex flex-shrink-0 gap-1 border-b border-zinc-700 px-3 py-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
              tab === id
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 bg-blue-900/40 px-4 py-1.5 text-xs text-blue-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
          در حال ذخیره...
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
          />
        ) : (
          <SidebarStyleTab
            primaryColor={primaryColor}
            fontFamily={fontFamily}
            borderRadius={borderRadius}
            darkMode={darkMode}
            sectionSpacing={sectionSpacing}
            containerWidth={containerWidth}
            headingScale={headingScale}
            blocks={blocks}
            onColorChange={onColorChange}
            onFontFamilyChange={onFontFamilyChange}
            onBorderRadiusChange={onBorderRadiusChange}
            onDarkModeChange={onDarkModeChange}
            onDesignSizeChange={onDesignSizeChange}
            onBannerImageChange={onBannerImageChange}
          />
        )}
      </div>

      {/* Footer – cover + save buttons + reset */}
      <div className="flex-shrink-0 space-y-2 border-t border-zinc-700 p-4">
        {saveMode && onCoverImageChange && (
          <CoverImageSection
            coverImage={coverImage}
            onChange={onCoverImageChange}
          />
        )}

        {saveMode === 'copy' && onSaveAsCopy && (
          <button
            type="button"
            onClick={onSaveAsCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-600/10 py-2.5 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-600/20"
          >
            <Save className="h-4 w-4" />
            ذخیره تغییرات سایت من
          </button>
        )}

        {saveMode === 'override' && onSaveOverride && (
          <button
            type="button"
            onClick={onSaveOverride}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600/10 py-2.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-600/20"
          >
            <Save className="h-4 w-4" />
            ذخیره قالب
          </button>
        )}

        {saveMode === 'admin-override' && onSaveOverride && (
          <button
            type="button"
            onClick={onSaveOverride}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <Save className="h-4 w-4" />
            ذخیره و انتشار
          </button>
        )}

        {saveMode === 'both' && onSaveOverride && (
          <button
            type="button"
            onClick={onSaveOverride}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <Save className="h-4 w-4" />
            ذخیره
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-600/10 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-600/20"
        >
          <RotateCcw className="h-4 w-4" />
          بازگشت به حالت اولیه
        </button>
      </div>
    </div>
  );
}
