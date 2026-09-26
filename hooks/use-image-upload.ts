'use client';

import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { tNow } from '@/lib/i18n/t-now';
import { assertImageFile, MAX_IMAGE_UPLOAD_BYTES } from '@/lib/upload-limits';

export interface ImageUploadState {
  /** Id of the freshly uploaded image, or null when nothing was uploaded yet. */
  id: string | null;
  /** URL to render — an object URL while uploading, the stored URL otherwise. */
  preview: string;
  uploading: boolean;
  upload: (file: File) => Promise<void>;
  /** Restore to a known preview (modal open, or after a failed upload). */
  reset: (preview?: string) => void;
}

/**
 * Upload one image and remember its id, for branding fields (logo, favicon).
 * A failed upload rolls the preview back, so the form never shows an image the
 * server does not have.
 */
export function useImageUpload(maxBytes = MAX_IMAGE_UPLOAD_BYTES): ImageUploadState {
  const [id, setId] = useState<string | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      try {
        assertImageFile(file, maxBytes);
      } catch (error) {
        toast.error(apiErrorMessage(error, tNow('toasts.imageUploadFailed')));
        return;
      }
      const previous = preview;
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      try {
        const uploaded = await apiClient.uploadImage(file);
        const raw = uploaded as unknown as Record<string, unknown>;
        const data = (raw?.data ?? raw) as Record<string, unknown>;
        const uploadedId = data?.id;
        if (uploadedId !== undefined && uploadedId !== null) {
          setId(String(uploadedId));
        }
      } catch (error) {
        toast.error(apiErrorMessage(error, tNow('toasts.imageUploadFailed')));
        setPreview(previous);
        setId(null);
      } finally {
        setUploading(false);
      }
    },
    [preview, maxBytes],
  );

  const reset = useCallback((next = '') => {
    setId(null);
    setPreview(next);
  }, []);

  return { id, preview, uploading, upload, reset };
}
