'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { KycState } from '@/types/kyc';

type UseKycOptions = {
  /** When true, failed fetches hide the badge without a toast (nav/dropdown). */
  silent?: boolean;
};

/** Light fetch for profile badge / domain gate. */
export function useKyc(enabled: boolean, options?: UseKycOptions) {
  const silent = options?.silent === true;
  const [state, setState] = useState<KycState | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled) {
      setState(null);
      setIsLoading(false);
      return;
    }
    try {
      setState(await apiClient.getKyc());
    } catch (error) {
      setState(null);
      if (!silent) {
        ErrorHandler.handleApiError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, silent]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { state, isLoading, reload, setState };
}
