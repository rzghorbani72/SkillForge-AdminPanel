'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ScaledIframeProps {
  src: string;
  title: string;
  // Virtual render width the page is scaled down from. 1280 ≈ desktop.
  virtualWidth?: number;
  // Allows scrolling/clicking inside the frame; inert thumbnail by default.
  interactive?: boolean;
  onLoad?: () => void;
  showLoading?: boolean;
  className?: string;
}

// Renders a page at desktop width and scales it down to fit its container.
export function ScaledIframe({
  src,
  title,
  virtualWidth = 1280,
  interactive = false,
  onLoad,
  showLoading = false,
  className = '',
}: ScaledIframeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.2);
  const [loaded, setLoaded] = useState(false);

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

  return (
    // dir=ltr keeps the oversized inner box anchored at the visual left edge —
    // in an RTL page it would overflow leftward and the scaled content would
    // land outside the container. The iframe document handles its own RTL.
    <div ref={containerRef} dir="ltr" className={`relative overflow-hidden ${className}`}>
      <div
        className="origin-top-left"
        style={{
          width: virtualWidth,
          height: `${100 / zoom}%`,
          transform: `scale(${zoom})`,
        }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          tabIndex={interactive ? undefined : -1}
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
          className={`h-full w-full border-0 ${interactive ? '' : 'pointer-events-none'}`}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {showLoading && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
        </div>
      )}
    </div>
  );
}
