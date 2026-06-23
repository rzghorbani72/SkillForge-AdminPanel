'use client';

import { Loader2 } from 'lucide-react';
import type { ViewportMode } from './sidebar-types';

const VIEWPORT: Record<
  ViewportMode,
  { width: string; frame: string; notch: boolean }
> = {
  mobile: {
    width: 'max-w-[390px]',
    frame: 'rounded-[32px] ring-4 ring-zinc-700 shadow-2xl',
    notch: true
  },
  tablet: {
    width: 'max-w-[768px]',
    frame: 'rounded-[16px] ring-2 ring-zinc-700 shadow-xl',
    notch: false
  },
  desktop: { width: 'w-full', frame: '', notch: false }
};

export function EditorPreview({
  viewport,
  iframeSrc,
  isLoading,
  title
}: {
  viewport: ViewportMode;
  iframeSrc: string | null;
  isLoading: boolean;
  title: string;
}) {
  const v = VIEWPORT[viewport];
  const isDesktop = viewport === 'desktop';

  return (
    <div className="relative flex flex-1 justify-center overflow-hidden bg-zinc-950 p-0">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500">
              در حال بارگذاری پیش‌نمایش...
            </p>
          </div>
        </div>
      )}
      <div
        className={`relative mx-auto flex h-full w-full flex-col ${v.width} ${
          isDesktop ? '' : 'my-4 overflow-hidden bg-white'
        } ${v.frame}`}
      >
        {v.notch && (
          <span className="absolute left-1/2 top-1.5 z-20 h-1.5 w-20 -translate-x-1/2 rounded-full bg-zinc-800" />
        )}
        {iframeSrc && (
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            className="h-full w-full border-0"
            title={title}
          />
        )}
      </div>
    </div>
  );
}
