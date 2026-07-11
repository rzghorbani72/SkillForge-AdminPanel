'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { EntitySearchOption } from '@/types/entity-search';

interface UseEntitySearchParams {
  fetchOptions: (query: string) => Promise<EntitySearchOption[]>;
  enabled?: boolean;
}

export function useEntitySearch({
  fetchOptions,
  enabled = true
}: UseEntitySearchParams) {
  const [options, setOptions] = useState<EntitySearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const requestIdRef = useRef(0);

  const runFetch = useCallback(
    async (searchQuery: string) => {
      if (!enabled) {
        setOptions([]);
        return;
      }

      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const results = await fetchOptions(searchQuery);
        if (requestId === requestIdRef.current) {
          setOptions(results);
        }
      } catch {
        if (requestId === requestIdRef.current) {
          setOptions([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [enabled, fetchOptions]
  );

  useEffect(() => {
    if (!enabled) {
      setOptions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      void runFetch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [enabled, query, runFetch]);

  const refresh = useCallback(() => {
    void runFetch(query);
  }, [query, runFetch]);

  return {
    options,
    loading,
    query,
    setQuery,
    refresh
  };
}
