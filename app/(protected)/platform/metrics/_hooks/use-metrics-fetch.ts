'use client';

import { useEffect, useState } from 'react';
import type { MetricsQuery } from '@/lib/api';

/**
 * Loads one metrics endpoint whenever the shared query (window + currency)
 * changes. A cancelled in-flight request never overwrites a newer result.
 */
export function useMetricsFetch<T>(
  query: MetricsQuery,
  load: (query: MetricsQuery) => Promise<T>,
): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const parsed = JSON.parse(queryKey) as MetricsQuery;

    const run = async () => {
      try {
        const result = await load(parsed);
        if (active) setData(result);
      } catch {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
    // `load` is a one-line apiClient wrapper; the window lives in `queryKey`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return { data, loading };
}
