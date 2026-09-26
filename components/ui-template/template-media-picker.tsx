'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';
import { IMAGE_ACCEPT } from '@/lib/upload-limits';

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
export const TemplateMediaPicker = forwardRef<TemplateMediaPickerHandle, TemplateMediaPickerProps>(
  function TemplateMediaPicker({ onUploaded }, ref) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingRef = useRef<PendingMediaTarget | null>(null);
    // The upload happens with no visible control of its own — without this the
    // canvas sits unchanged for the whole transfer and looks like nothing happened.
    const [progress, setProgress] = useState<number | null>(null);

    useImperativeHandle(ref, () => ({
      open: (target: PendingMediaTarget) => {
        pendingRef.current = target;
        inputRef.current?.click();
      },
    }));

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const target = pendingRef.current;
      if (!file || !target) return;
      try {
        setProgress(0);
        const result = await apiClient.uploadImage(file, { title: 'Section Media' }, (percent) =>
          setProgress(percent),
        );
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
        setProgress(null);
        pendingRef.current = null;
        e.target.value = '';
      }
    };

    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={handleChange}
        />
        {progress !== null && (
          <div
            dir="rtl"
            className="fixed bottom-6 left-1/2 z-[60] flex w-64 -translate-x-1/2 flex-col gap-2 rounded-xl bg-zinc-900/90 px-4 py-3 text-white shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="flex-1">{t('sitePreview.panelUploading')}</span>
              <span className="tabular-nums">{formatNumber(Math.round(progress))}٪</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </>
    );
  },
);
