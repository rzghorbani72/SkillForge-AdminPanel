'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  appendPreviewCacheBuster,
  buildEmbedPreviewUrl,
  buildFullPreviewUrl
} from '@/lib/ui-template/preview-url';
import type { ThemeDraftPayload } from '@/lib/ui-template/theme-draft-payload';
import type { UIBlockConfig } from '@/types/api';
import { applyThemeVariables, dispatchThemeUpdate } from '@/lib/theme';

interface UseUiTemplatePreviewOptions {
  storeSlug: string;
  blocks: UIBlockConfig[];
  hasTemplate: boolean;
  isActive: boolean;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  buildThemePayload: () => ThemeDraftPayload;
  onDraftSaved?: () => void;
  debounceMs?: number;
}

export function useUiTemplatePreview({
  storeSlug,
  blocks,
  hasTemplate,
  isActive,
  isDirty,
  setIsDirty,
  buildThemePayload,
  onDraftSaved,
  debounceMs = 900
}: UseUiTemplatePreviewOptions) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [isPreviewSyncing, setIsPreviewSyncing] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  const persistDraft = useCallback(
    async (silent = false) => {
      const templatePayload = {
        blocks,
        template_preset: null,
        is_active: isActive
      };
      const colorPayload = buildThemePayload();

      await Promise.all([
        hasTemplate
          ? apiClient.saveUITemplateDraft(templatePayload)
          : apiClient.createUITemplate({ blocks, is_active: isActive }),
        apiClient.saveThemeDraft(colorPayload)
      ]);

      if (!silent) {
        applyThemeVariables(colorPayload);
        dispatchThemeUpdate(colorPayload);
      }

      onDraftSaved?.();
      return colorPayload;
    },
    [blocks, buildThemePayload, hasTemplate, isActive, onDraftSaved]
  );

  const bumpPreview = useCallback(() => {
    setPreviewRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!storeSlug) {
      setPreviewUrl(null);
      setIsPreviewReady(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const session = await apiClient.getTemplatePreviewSession();
        if (!cancelled) {
          setPreviewUrl(
            buildEmbedPreviewUrl(session.token, session.previewPath)
          );
          setIsPreviewReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setIsPreviewReady(false);
          ErrorHandler.handleApiError(error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storeSlug]);

  useEffect(() => {
    if (!isDirty || !previewUrl) return;

    const timer = window.setTimeout(async () => {
      setIsPreviewSyncing(true);
      try {
        await persistDraft(true);
        bumpPreview();
        setIsDirty(false);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsPreviewSyncing(false);
      }
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [isDirty, previewUrl, persistDraft, bumpPreview, debounceMs, setIsDirty]);

  const openFullPreview = useCallback(async () => {
    if (!previewUrl) return;
    await persistDraft(true);
    bumpPreview();
    window.open(
      buildFullPreviewUrl(previewUrl),
      '_blank',
      'noopener,noreferrer'
    );
  }, [previewUrl, persistDraft, bumpPreview]);

  const iframeSrc = previewUrl
    ? appendPreviewCacheBuster(previewUrl, previewRefreshKey)
    : null;

  return {
    previewUrl,
    iframeSrc,
    isPreviewSyncing,
    isPreviewReady,
    persistDraft,
    bumpPreview,
    openFullPreview
  };
}
