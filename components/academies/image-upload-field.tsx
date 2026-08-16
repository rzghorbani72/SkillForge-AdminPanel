'use client';

import { useRef } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageUploadFieldProps {
  label: string;
  hint: string;
  previewUrl: string;
  uploading: boolean;
  onFile: (file: File) => void;
  /** Drop-zone height — logos get a tall box, favicons a small square one. */
  size?: 'md' | 'sm';
  /** Replaces the hint once a file is picked, e.g. "click to replace". */
  replaceHint?: string;
}

// Shared branding drop-zone used by the academy create and edit modals for both
// the logo and the favicon, so the four upload boxes stay visually identical.
export function ImageUploadField({
  label,
  hint,
  previewUrl,
  uploading,
  onFile,
  size = 'md',
  replaceHint
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full flex-col">
      {/* One fixed-height line: a label that wrapped would push its own box
          out of line with the box beside it. */}
      <label className="mb-2 block h-5 truncate text-sm font-medium leading-5">
        {label}
      </label>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group flex w-full flex-1 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 px-2 transition-colors hover:border-primary/60 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60',
          size === 'md' ? 'min-h-32' : 'min-h-24'
        )}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : previewUrl ? (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 p-2">
            <img
              src={previewUrl}
              alt={label}
              className="max-h-16 w-full object-contain"
            />
            <span className="text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {replaceHint ?? hint}
            </span>
          </span>
        ) : (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm transition-colors group-hover:bg-primary/10">
              <Upload className="h-4 w-4 text-muted-foreground" />
            </span>
            <p className="text-center text-[11px] leading-4 text-muted-foreground">
              {hint}
            </p>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label={label}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
