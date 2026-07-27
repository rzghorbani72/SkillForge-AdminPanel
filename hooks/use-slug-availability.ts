'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import { isValidSlug, RESERVED_SLUGS, type SlugStatus } from '@/lib/slug';

const DEBOUNCE_MS = 400;

type UseSlugAvailabilityOptions = {
  /** The academy's own current subdomain — re-saving it is always allowed. */
  ownSlug?: string;
};

export function useSlugAvailability({
  ownSlug
}: UseSlugAvailabilityOptions = {}) {
  const [status, setStatus] = useState<SlugStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);

  const cancelPending = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    requestRef.current += 1;
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const check = useCallback(
    (slug: string) => {
      cancelPending();
      const request = requestRef.current;

      if (!slug || slug === ownSlug) {
        setStatus('idle');
        return;
      }
      if (!isValidSlug(slug)) {
        setStatus('invalid');
        return;
      }
      if (RESERVED_SLUGS.has(slug)) {
        setStatus('taken');
        return;
      }

      setStatus('checking');
      timerRef.current = setTimeout(async () => {
        try {
          const result = await apiClient.checkSlugAvailability(slug);
          if (request !== requestRef.current) return;
          setStatus(result.available ? 'available' : 'taken');
        } catch {
          if (request !== requestRef.current) return;
          setStatus('idle');
        }
      }, DEBOUNCE_MS);
    },
    [cancelPending, ownSlug]
  );

  const reset = useCallback(() => {
    cancelPending();
    setStatus('idle');
  }, [cancelPending]);

  return { status, check, reset };
}

export function isSlugBlocking(status: SlugStatus): boolean {
  return status === 'taken' || status === 'invalid' || status === 'checking';
}
