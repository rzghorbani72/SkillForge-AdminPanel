'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

export type PersonLookup = {
  found: boolean;
  user_id: string | null;
  name: string | null;
  /** Their role in YOUR academy, or null when they are not a member here. */
  membership: { role: string; is_active: boolean } | null;
};

/**
 * "Who is this phone number?" — the first step of adding someone. Kept apart
 * from the dialog so the same three outcomes (unknown / known / already here)
 * can back any other add surface later.
 */
export function usePersonLookup() {
  const [result, setResult] = useState<PersonLookup | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (phone: string) => {
    if (!phone.trim()) return;
    setIsSearching(true);
    try {
      const found = await apiClient.lookupPersonByPhone(phone.trim());
      setResult(found);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const reset = useCallback(() => setResult(null), []);

  return { result, isSearching, search, reset };
}
