'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * After a fetch, wait one frame so Recharts has a size, then mount the
 * series so the draw animation actually plays. Period changes remount via
 * `key` on the chart itself — this hook does not flash a placeholder then.
 */
export function useChartReveal(isLoading: boolean): boolean {
  const [ready, setReady] = useState(!isLoading);
  const wasLoading = useRef(isLoading);

  useEffect(() => {
    if (isLoading) {
      wasLoading.current = true;
      setReady(false);
      return;
    }
    if (!wasLoading.current) {
      setReady(true);
      return;
    }
    wasLoading.current = false;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [isLoading]);

  return ready;
}

export function ChartLoading({ className, label }: { className?: string; label: string }) {
  return <div className={cn('shimmer rounded-2xl', className)} aria-label={label} role="status" />;
}
