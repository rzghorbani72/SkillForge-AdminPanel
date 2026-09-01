'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

interface AvatarUpload {
  avatarUrl: string | null;
  isUploading: boolean;
  progress: number;
  upload: (file: File) => Promise<void>;
}

/** Uploads the image, then links it to the signed-in profile as the avatar. */
export function useAvatarUpload(
  initialUrl: string | null,
  onUploaded: () => void
): AvatarUpload {
  const { t } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialUrl) setAvatarUrl(initialUrl);
  }, [initialUrl]);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    []
  );

  const upload = useCallback(
    async (file: File) => {
      if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
        ErrorHandler.showWarning(t('settings.photoInvalidType'));
        return;
      }
      if (file.size > AVATAR_MAX_BYTES) {
        ErrorHandler.showWarning(t('settings.photoTooLarge'));
        return;
      }

      const preview = URL.createObjectURL(file);
      previewRef.current = preview;
      setAvatarUrl(preview);
      setIsUploading(true);
      setProgress(0);

      try {
        const uploaded = await apiClient.uploadImage(
          file,
          { title: 'Avatar' },
          setProgress
        );
        if (!uploaded?.id) throw new Error('upload_failed');
        await apiClient.updateProfile({ image_id: String(uploaded.id) });
        if (uploaded.publicUrl) setAvatarUrl(uploaded.publicUrl);
        ErrorHandler.showSuccess(t('settings.photoUpdatedSuccess'));
        onUploaded();
      } catch (error) {
        ErrorHandler.handleApiError(error);
        setAvatarUrl(initialUrl);
      } finally {
        setIsUploading(false);
      }
    },
    [initialUrl, onUploaded, t]
  );

  return { avatarUrl, isUploading, progress, upload };
}
