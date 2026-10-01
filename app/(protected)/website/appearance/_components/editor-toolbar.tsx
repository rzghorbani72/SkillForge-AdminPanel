'use client';

import { X, Monitor, Undo2, Redo2 } from 'lucide-react';
import type { Academy, TemplatePreset, UIBlockConfig } from '@/types/api';
import { formatPresetDisplayName } from '@/lib/ui-template/preset-source';
import type { ViewportMode } from '@/components/ui-template/sidebar-types';
import { EditorToolbarActions } from './editor-toolbar-actions';
import type { Dispatch, SetStateAction } from 'react';
import { PendingSave } from '@/app/(protected)/website/appearance/_components/appearance-workspace';

export function EditorToolbar({
  VIEWPORTS,
  currentAcademy,
  doSave,
  future,
  handleClosePreview,
  handleToggleRealData,
  history,
  isAdmin,
  isApplied,
  isEditingMaster,
  isPublicPreset,
  isPublishing,
  isSaving,
  redo,
  savedAgo,
  selectedPreset,
  setPendingSave,
  setShowCustomizer,
  setViewport,
  showCustomizer,
  undo,
  useRealData,
  viewport,
}: {
  VIEWPORTS: { mode: ViewportMode; icon: typeof Monitor; label: string }[];
  currentAcademy: Academy | null;
  doSave: () => Promise<void>;
  future: UIBlockConfig[][];
  handleClosePreview: () => void;
  handleToggleRealData: () => void;
  history: UIBlockConfig[][];
  isAdmin: boolean;
  isApplied: boolean;
  isEditingMaster: boolean;
  isPublicPreset: boolean;
  isPublishing: boolean;
  isSaving: boolean;
  redo: () => void;
  savedAgo: string;
  selectedPreset: TemplatePreset;
  setPendingSave: Dispatch<SetStateAction<PendingSave | null>>;
  setShowCustomizer: Dispatch<SetStateAction<boolean>>;
  setViewport: Dispatch<SetStateAction<ViewportMode>>;
  showCustomizer: boolean;
  undo: () => void;
  useRealData: boolean;
  viewport: ViewportMode;
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2.5">
      <button
        type="button"
        title="بستن پیش‌نمایش"
        onClick={handleClosePreview}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
      >
        <X className="h-4 w-4" />
      </button>

      <span
        title={selectedPreset.name}
        className="max-w-[40vw] truncate text-sm font-semibold text-zinc-900"
      >
        {formatPresetDisplayName(selectedPreset.name)}
      </span>

      {isAdmin && isPublicPreset && (
        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
          قالب اصلی
        </span>
      )}

      {/* Draft status chip */}
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            isSaving
              ? 'animate-pulse bg-amber-400'
              : isEditingMaster
                ? 'bg-amber-400'
                : 'bg-emerald-400'
          }`}
        />
        <span className="text-[11px] text-zinc-600">
          {isSaving
            ? 'در حال ذخیره...'
            : savedAgo
              ? `ذخیره شد ${savedAgo}${isApplied ? '' : ' · منتشر نشده'}`
              : isEditingMaster
                ? 'در حال ویرایش قالب اصلی'
                : 'پیش‌نمایش زنده'}
        </span>
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          title="واگرد (Ctrl+Z)"
          onClick={undo}
          disabled={history.length === 0}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-30"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="ازنو (Ctrl+Y)"
          onClick={redo}
          disabled={future.length === 0}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-30"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <EditorToolbarActions
        VIEWPORTS={VIEWPORTS}
        currentAcademy={currentAcademy}
        doSave={doSave}
        handleToggleRealData={handleToggleRealData}
        isAdmin={isAdmin}
        isApplied={isApplied}
        isPublishing={isPublishing}
        isSaving={isSaving}
        setPendingSave={setPendingSave}
        setShowCustomizer={setShowCustomizer}
        setViewport={setViewport}
        showCustomizer={showCustomizer}
        useRealData={useRealData}
        viewport={viewport}
      />
    </div>
  );
}
