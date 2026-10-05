'use client';

import { useCallback, useState } from 'react';
import { isCroppable, type CropPreset } from '@/lib/image-crop';
import type { ImageCropDialogProps } from '@/components/shared/image-crop-dialog';

/** Routes a picked image through the crop dialog first; no preset = upload as-is. */
export function useImageCrop(preset: CropPreset | undefined, onFile: (file: File) => void) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const pick = useCallback(
    (file: File) => {
      if (preset && isCroppable(file)) setPendingFile(file);
      else onFile(file);
    },
    [preset, onFile],
  );

  const dialog: ImageCropDialogProps | null = preset
    ? {
        file: pendingFile,
        preset,
        onCancel: () => setPendingFile(null),
        onCropped: (file) => {
          setPendingFile(null);
          onFile(file);
        },
      }
    : null;

  return { pick, dialog };
}
