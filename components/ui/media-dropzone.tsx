'use client';

import React, { useRef, useState } from 'react';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import ProgressBar from './ProgressBar';

interface MediaDropzoneProps {
  accept: string;
  icon: React.ReactNode;
  placeholderText: string;
  placeholderSubtext: string;
  /** Rendered instead of the placeholder once a file is attached. */
  filled?: React.ReactNode;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadingLabel?: string;
  disabled?: boolean;
  onFile: (file: File) => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * The single upload surface used across the app: click or drop a file and it
 * uploads right away. Each media type only supplies its own preview, so video,
 * audio, document and image uploads all look and behave the same.
 */
const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  accept,
  icon,
  placeholderText,
  placeholderSubtext,
  filled,
  isUploading = false,
  uploadProgress = 0,
  uploadingLabel,
  disabled = false,
  onFile,
  onRemove,
  className
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => {
    if (!disabled && !isUploading) inputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg border-2 border-dashed transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border',
        !disabled && !filled && 'cursor-pointer hover:border-primary/60',
        className
      )}
      onClick={filled ? undefined : openPicker}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!disabled && !isUploading && file) onFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />

      {filled ? (
        <div className="relative p-4">
          {onRemove && !isUploading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={disabled}
              className="absolute end-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              aria-label={t('common.remove')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {filled}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
            disabled={disabled || isUploading}
            className="mt-3 text-xs font-medium text-primary underline"
          >
            {t('media.replaceFile')}
          </button>
        </div>
      ) : (
        <div className="flex min-h-[10rem] w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center">
          {icon}
          <p className="text-sm font-medium text-foreground">
            {placeholderText}
          </p>
          <p className="text-xs text-muted-foreground">{placeholderSubtext}</p>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/85 px-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-xs font-medium text-foreground">
              {uploadingLabel ?? t('common.uploading')}
            </p>
          </div>
          <ProgressBar
            progress={uploadProgress}
            size="sm"
            className="max-w-[220px]"
          />
        </div>
      )}

      {!filled && !isUploading && (
        <div className="pointer-events-none absolute bottom-2 end-2 text-muted-foreground/60">
          <UploadCloud className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default MediaDropzone;
