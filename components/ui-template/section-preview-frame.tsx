'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SectionPreviewFrameProps {
  // Storefront origin that serves /preview/blocks (from the preview session).
  baseUrl: string;
  templateKey: string;
  // When set, renders only this block; otherwise the whole template.
  blockId?: string;
  // Preview token carrying academy scope (lets dedicated templates resolve).
  token?: string;
  // Virtual render width the iframe is scaled down from. 1280 ≈ desktop.
  virtualWidth?: number;
  // Allows scrolling/clicking inside the frame instead of the default inert
  // thumbnail behavior.
  interactive?: boolean;
  // Extra query params forwarded to /preview/blocks (e.g. heroStyle override).
  params?: Record<string, string>;
  // Fires once the embedded storefront finishes loading (for fade-in/placeholder).
  onLoad?: () => void;
  className?: string;
}

// Real storefront render of a template/section, scaled to fit its container.
// Non-interactive by default (pointer-events-none) so a surrounding card stays
// clickable; pass `interactive` for a scrollable embedded page.
export function SectionPreviewFrame({
  baseUrl,
  templateKey,
  blockId,
  token,
  virtualWidth = 1280,
  interactive = false,
  params,
  onLoad,
  className = ''
}: SectionPreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.2);

  const recalc = useCallback(() => {
    if (containerRef.current) {
      setZoom(containerRef.current.clientWidth / virtualWidth);
    }
  }, [virtualWidth]);

  useEffect(() => {
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recalc]);

  // embed=1 makes the storefront proxy allow AdminPanel as a frame ancestor;
  // sample=1 swaps the visitor's academy brand for the neutral sample brand.
  const queryParams = new URLSearchParams({
    template: templateKey,
    embed: '1',
    sample: '1'
  });
  if (blockId) queryParams.set('only', blockId);
  if (token) queryParams.set('token', token);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      queryParams.set(key, value);
    }
  }
  const src = `${baseUrl.replace(/\/$/, '')}/preview/blocks?${queryParams.toString()}`;

  return (
    // dir=ltr keeps the oversized inner box anchored at the visual left edge —
    // in an RTL page it would overflow leftward and the scaled content would
    // land outside the container. The iframe document handles its own RTL.
    <div
      ref={containerRef}
      dir="ltr"
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="origin-top-left"
        style={{
          width: virtualWidth,
          height: `${100 / zoom}%`,
          transform: `scale(${zoom})`
        }}
      >
        <iframe
          src={src}
          title="Section preview"
          loading="lazy"
          onLoad={onLoad}
          className={`h-full w-full border-0 ${
            interactive ? '' : 'pointer-events-none'
          }`}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
