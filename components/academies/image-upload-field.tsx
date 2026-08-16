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
}

// Shared branding drop-zone used by the academy create and edit modals for both
// the logo and the favicon, so the four upload boxes stay visually identical.
export function ImageUploadField({
  label,
  hint,
  previewUrl,
  uploading,
  onFile,
  size = 'md'
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60',
          size === 'md' ? 'h-32' : 'h-20'
        )}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="px-3 text-center text-xs text-muted-foreground">
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
