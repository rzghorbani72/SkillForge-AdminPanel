'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';

export interface PendingMediaTarget {
  blockId: string;
  fieldKey: string;
}

export interface TemplateMediaPickerHandle {
  open: (target: PendingMediaTarget) => void;
}

interface TemplateMediaPickerProps {
  onUploaded: (blockId: string, fieldKey: string, url: string) => void;
}

/** Hidden file input triggered by the preview iframe for canvas media upload. */
export const TemplateMediaPicker = forwardRef<
  TemplateMediaPickerHandle,
  TemplateMediaPickerProps
>(function TemplateMediaPicker({ onUploaded }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<PendingMediaTarget | null>(null);

  useImperativeHandle(ref, () => ({
    open: (target: PendingMediaTarget) => {
      pendingRef.current = target;
      inputRef.current?.click();
    }
  }));

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = pendingRef.current;
    if (!file || !target) return;
    try {
      const result = await apiClient.uploadImage(file, {
        title: 'Section Media'
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
        onUploaded(target.blockId, target.fieldKey, url);
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      pendingRef.current = null;
      e.target.value = '';
    }
  };

  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*,image/gif,image/webp"
      className="hidden"
      onChange={handleChange}
    />
  );
});
