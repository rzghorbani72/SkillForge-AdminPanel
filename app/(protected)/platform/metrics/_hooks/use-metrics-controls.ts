'use client';

import { useCallback, useMemo, useState } from 'react';
import type { MetricsCurrency, MetricsQuery } from '@/lib/api';

export type MetricsSource = 'live' | 'snapshot';

/** Trailing twelve months, the window an investor expects by default. */
function defaultFrom(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)
  ).toISOString();
}

/**
 * The three controls every tab shares: the window, the display currency, and
 * whether figures come from the live recompute or the immutable monthly ledger.
 */
export function useMetricsControls() {
  const [from, setFrom] = useState<string>(defaultFrom);
  const [to, setTo] = useState<string>(() => new Date().toISOString());
  const [currency, setCurrency] = useState<MetricsCurrency>('TOMAN');
  const [source, setSource] = useState<MetricsSource>('snapshot');

  const query = useMemo<MetricsQuery>(
    () => ({ from, to, currency }),
    [from, to, currency]
  );

  const setRange = useCallback((next: { from: string; to: string }) => {
    setFrom(next.from);
    setTo(next.to);
  }, []);

  return {
    query,
    currency,
    setCurrency,
    source,
    setSource,
    setRange,
    from,
    to
  };
}
