'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { EntitySearchOption } from '@/types/entity-search';

const DEBOUNCE_MS = 300;

interface UseEntitySearchParams {
  /**
   * The signal is aborted when the query changes, the popover closes, or the
   * component unmounts. Fetchers that ignore it still work, they just keep
   * running to completion.
   */
  fetchOptions: (query: string, signal?: AbortSignal) => Promise<EntitySearchOption[]>;
  enabled?: boolean;
}

export function useEntitySearch({ fetchOptions, enabled = true }: UseEntitySearchParams) {
  const [options, setOptions] = useState<EntitySearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const runFetch = useCallback(
    async (searchQuery: string) => {
      abortRef.current?.abort();

      if (!enabled) {
        abortRef.current = null;
        setOptions([]);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const results = await fetchOptions(searchQuery, controller.signal);
        if (!controller.signal.aborted) setOptions(results);
      } catch {
        if (!controller.signal.aborted) setOptions([]);
      } finally {
        // A superseded request must not clear the spinner the new one owns.
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [enabled, fetchOptions],
  );

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort();
      abortRef.current = null;
      setOptions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      void runFetch(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [enabled, query, runFetch]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const refresh = useCallback(() => {
    void runFetch(query);
  }, [query, runFetch]);

  return {
    options,
    loading,
    query,
    setQuery,
    refresh,
  };
}
