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
  className?: string;
}

// Real storefront render of a template/section, scaled to fit its container.
// Non-interactive (pointer-events-none) so the surrounding card stays clickable.
export function SectionPreviewFrame({
  baseUrl,
  templateKey,
  blockId,
  token,
  virtualWidth = 1280,
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

  const params = new URLSearchParams({ template: templateKey });
  if (blockId) params.set('only', blockId);
  if (token) params.set('token', token);
  const src = `${baseUrl.replace(/\/$/, '')}/preview/blocks?${params.toString()}`;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
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
          className="pointer-events-none h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
