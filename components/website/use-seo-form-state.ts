'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useImageUpload } from '@/hooks/use-image-upload';
import { resolveMediaUrl } from '@/lib/media-url';
import type { Academy } from '@/types/api';

export const META_TITLE_MAX = 60;
export const META_DESCRIPTION_MAX = 160;

export type SeoFormState = ReturnType<typeof useSeoFormState>;

/**
 * Empty means "no override" — the site then falls back to the academy name and
 * description. So the form must send null, not an empty string, to clear a field.
 */
const toPayloadValue = (value: string): string | null => value.trim() || null;

export function useSeoFormState() {
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const shareImage = useImageUpload();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCurrentAcademyDetail();
      setAcademy(data);
      setMetaTitle(data.meta_title ?? '');
      setMetaDescription(data.meta_description ?? '');
      shareImage.reset(resolveMediaUrl(data.og_image?.publicUrl));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
    // `shareImage` is a stable ref-like hook result; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await apiClient.updateAcademy({
        meta_title: toPayloadValue(metaTitle),
        meta_description: toPayloadValue(metaDescription),
        ...(shareImage.id ? { og_image_id: shareImage.id } : {}),
      });
      ErrorHandler.showSuccess('website.seo.saved', true);
      await load();
      return true;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [metaTitle, metaDescription, shareImage.id, load]);

  const tooLong =
    metaTitle.length > META_TITLE_MAX || metaDescription.length > META_DESCRIPTION_MAX;

  return {
    academy,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    shareImage,
    loading,
    saving,
    canSave: !loading && !saving && !shareImage.uploading && !tooLong,
    save,
  };
}
