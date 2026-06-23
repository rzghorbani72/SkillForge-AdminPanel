'use client';

import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';

export function AccordionSection({
  title,
  defaultOpen = false,
  children
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-700/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-right text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/60"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

const COVER_ASPECT = 'aspect-[16/9]';

// Cover image for this template's gallery card, cropped to the locked 16/9
// ratio. Empty means the dedicated template inherits its source's cover.
export function CoverImageSection({
  coverImage,
  onChange
}: {
  coverImage?: string | null;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const result = await apiClient.uploadImage(file, {
        title: 'Template Cover'
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | string | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as
          | number
          | string
          | undefined);
      if (!id) throw new Error('Upload succeeded but no image id was returned');
      onChange(`${getBrowserApiBaseUrl()}/images/get-image?id=${id}`);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-zinc-300">تصویر کاور قالب</p>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`group relative w-full overflow-hidden rounded-lg border border-zinc-700 ${COVER_ASPECT}`}
      >
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt="cover"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 bg-zinc-800/40 text-zinc-500">
            <Upload className="h-4 w-4" />
            <span className="text-[10px]">آپلود تصویر کاور (۱۶:۹)</span>
          </span>
        )}
        {coverImage && (
          <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Upload className="h-3.5 w-3.5" />
            {isUploading ? 'در حال آپلود...' : 'تغییر کاور'}
          </span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        title="تصویر کاور قالب"
        aria-label="تصویر کاور قالب"
        className="hidden"
        onChange={handleUpload}
        disabled={isUploading}
      />
    </div>
  );
}
