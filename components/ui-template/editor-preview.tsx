'use client';

import type { Ref } from 'react';
import { Loader2 } from 'lucide-react';
import type { ViewportMode } from './sidebar-types';

const VIEWPORT: Record<
  ViewportMode,
  { width: string; frame: string; notch: boolean }
> = {
  mobile: {
    width: 'max-w-[390px]',
    frame: 'rounded-[32px] ring-4 ring-zinc-300 shadow-2xl',
    notch: true
  },
  tablet: {
    width: 'max-w-[768px]',
    frame: 'rounded-[16px] ring-2 ring-zinc-300 shadow-xl',
    notch: false
  },
  desktop: { width: 'w-full', frame: '', notch: false }
};

export function EditorPreview({
  viewport,
  iframeSrc,
  isLoading,
  isSaving,
  title,
  iframeRef,
  onIframeLoad
}: {
  viewport: ViewportMode;
  iframeSrc: string | null;
  isLoading: boolean;
  isSaving?: boolean;
  title: string;
  iframeRef?: Ref<HTMLIFrameElement>;
  onIframeLoad?: () => void;
}) {
  const v = VIEWPORT[viewport];
  const isDesktop = viewport === 'desktop';

  return (
    <div className="relative flex flex-1 justify-center overflow-hidden bg-zinc-100 p-0">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-100">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
            <p className="text-sm text-zinc-500">
              در حال بارگذاری پیش‌نمایش...
            </p>
          </div>
        </div>
      )}
      {/* Subtle saving indicator — lets the user know the preview will refresh soon. */}
      {isSaving && !isLoading && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900/80 px-3 py-1.5 text-[11px] text-zinc-300 backdrop-blur-sm">
          <Loader2 className="h-3 w-3 animate-spin" />
          در حال اعمال تغییرات...
        </div>
      )}
      <div
        className={`relative mx-auto flex h-full w-full flex-col ${v.width} ${
          isDesktop ? '' : 'my-4 overflow-hidden bg-white'
        } ${v.frame}`}
      >
        {v.notch && (
          <span className="absolute left-1/2 top-1.5 z-20 h-1.5 w-20 -translate-x-1/2 rounded-full bg-zinc-100" />
        )}
        {iframeSrc && (
          // No key prop — React updates src in-place so the iframe element
          // stays alive and navigates to the new URL instead of being
          // unmounted/remounted (which caused a full white-flash on every save).
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            onLoad={onIframeLoad}
            className="h-full w-full border-0"
            title={title}
          />
        )}
      </div>
    </div>
  );
}
