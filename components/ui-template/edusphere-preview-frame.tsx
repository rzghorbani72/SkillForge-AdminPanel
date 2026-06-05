'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Circle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

export type DeviceMode = 'widescreen' | 'desktop' | 'tablet' | 'mobile';

const DEVICE_VIRTUAL_W: Record<DeviceMode, number> = {
  widescreen: 1920,
  desktop: 1280,
  tablet: 768,
  mobile: 375
};

interface EduspherePreviewFrameProps {
  iframeSrc: string | null;
  siteUrl?: string;
  deviceMode?: DeviceMode;
  isLoading?: boolean;
  isInitializing?: boolean;
  isReady?: boolean;
  emptyMessage?: string;
  unavailableMessage?: string;
}

export function EduspherePreviewFrame({
  iframeSrc,
  siteUrl,
  deviceMode = 'desktop',
  isLoading = false,
  isInitializing = false,
  isReady = true,
  emptyMessage,
  unavailableMessage
}: EduspherePreviewFrameProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);
  const virtualW = DEVICE_VIRTUAL_W[deviceMode];

  const recalcZoom = useCallback(() => {
    if (containerRef.current) {
      setZoom(containerRef.current.clientWidth / virtualW);
    }
  }, [virtualW]);

  useEffect(() => {
    recalcZoom();
    const ro = new ResizeObserver(recalcZoom);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recalcZoom]);

  useEffect(() => {
    recalcZoom();
  }, [deviceMode, recalcZoom]);

  const showIframe = Boolean(iframeSrc && isReady);
  const statusMessage = emptyMessage ?? t('settings.noBlocksMessage');
  const placeholderMessage = isInitializing
    ? t('settings.previewLoading')
    : (unavailableMessage ?? t('settings.previewUnavailable'));

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border shadow-md">
      <div className="flex flex-shrink-0 items-center gap-2 border-b bg-muted/40 px-3 py-2">
        <div className="flex gap-1.5">
          <Circle className="h-2.5 w-2.5 fill-red-400 text-red-400" />
          <Circle className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
          <Circle className="h-2.5 w-2.5 fill-green-400 text-green-400" />
        </div>
        <div className="flex-1 truncate rounded border bg-background px-3 py-0.5 text-xs text-muted-foreground">
          {siteUrl ?? t('sitePreview.defaultSiteUrl')}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-white"
      >
        {!showIframe ? (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {!isReady ? placeholderMessage : statusMessage}
          </div>
        ) : (
          <div
            className="origin-top-left"
            style={{
              width: virtualW,
              height: `${100 / zoom}%`,
              transform: `scale(${zoom})`
            }}
          >
            <iframe
              key={iframeSrc}
              src={iframeSrc!}
              title="Academy site preview"
              className="h-full w-full border-0"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}
        {isLoading && showIframe && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 text-xs text-muted-foreground">
            {t('settings.previewUpdating')}
          </div>
        )}
      </div>
    </div>
  );
}
