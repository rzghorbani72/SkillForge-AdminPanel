'use client';

import {
  Check,
  Loader2,
  Wand2,
  Pencil,
  Monitor,
  Database,
  Save,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VisitSiteLink } from '@/components/shared/visit-site-link';
import type { ViewportMode } from '@/components/ui-template/sidebar-types';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';
import { Academy } from '@/types/api';
import { PendingSave } from '@/app/(protected)/website/appearance/_components/appearance-workspace';

export function EditorToolbarActions({
  VIEWPORTS,
  currentAcademy,
  doSave,
  handleToggleRealData,
  isAdmin,
  isApplied,
  isPublishing,
  isSaving,
  setPendingSave,
  setShowCustomizer,
  setViewport,
  showCustomizer,
  useRealData,
  viewport,
}: {
  VIEWPORTS: { mode: ViewportMode; icon: typeof Monitor; label: string }[];
  currentAcademy: Academy | null;
  doSave: () => Promise<void>;
  handleToggleRealData: () => void;
  isAdmin: boolean;
  isApplied: boolean;
  isPublishing: boolean;
  isSaving: boolean;
  setPendingSave: Dispatch<SetStateAction<PendingSave | null>>;
  setShowCustomizer: Dispatch<SetStateAction<boolean>>;
  setViewport: Dispatch<SetStateAction<ViewportMode>>;
  showCustomizer: boolean;
  useRealData: boolean;
  viewport: ViewportMode;
}) {
  const { t } = useTranslation();
  return (
    <div className="ml-auto flex items-center gap-3">
      {/* Data source toggle: sample design vs real backend data */}
      <button
        type="button"
        onClick={handleToggleRealData}
        title={useRealData ? 'نمایش داده واقعی آکادمی' : 'نمایش داده نمونه'}
        className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
          useRealData
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
        }`}
      >
        <Database className="h-3.5 w-3.5" />
        {useRealData ? 'داده واقعی' : 'داده نمونه'}
      </button>

      {/* Viewport switcher */}
      <div className="flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5">
        {VIEWPORTS.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            type="button"
            title={label}
            onClick={() => setViewport(mode)}
            className={`flex h-6 w-7 items-center justify-center rounded-md transition-colors ${
              viewport === mode ? 'bg-white text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      <Button
        size="sm"
        onClick={() => setShowCustomizer((v) => !v)}
        className={`h-8 gap-1.5 px-3 text-xs font-semibold ${
          showCustomizer
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
        }`}
      >
        {isAdmin ? (
          <>
            <Pencil className="h-3.5 w-3.5" />
            ویرایش
          </>
        ) : (
          <>
            <Wand2 className="h-3.5 w-3.5" />
            سفارشی‌سازی
          </>
        )}
      </Button>

      <Button
        size="sm"
        variant="outline"
        title="Ctrl+S"
        onClick={doSave}
        disabled={isSaving || isPublishing}
        className="h-8 gap-1.5 px-3 text-xs font-semibold"
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5" />
        )}
        {t('sitePreview.saveSiteChanges')}
      </Button>

      {isApplied ? (
        <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          {t('sitePreview.publishedState')}
        </span>
      ) : (
        <Button
          size="sm"
          onClick={() => setPendingSave({ kind: 'publish' })}
          disabled={isPublishing || isSaving}
          className="h-8 gap-1.5 bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          {isPublishing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
          {isPublishing ? t('sitePreview.publishing') : t('sitePreview.publishToSite')}
        </Button>
      )}

      {isApplied ? (
        <VisitSiteLink academy={currentAcademy} variant="ghost" />
      ) : (
        // The live site still shows the previous version; say so instead
        // of letting the manager hunt for edits that were never published.
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setPendingSave({ kind: 'visitUnpublished' })}
        >
          <ExternalLink className="h-4 w-4" />
          {t('academy.visitSite')}
        </Button>
      )}
    </div>
  );
}
