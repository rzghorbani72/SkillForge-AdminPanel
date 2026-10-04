'use client';

import { useCallback, useEffect, useState } from 'react';
import { settlementApi, type SettlementSummary, type WithdrawalRecord } from '@/lib/api-settlement';

interface UseSettlementResult {
  summary: SettlementSummary | null;
  history: WithdrawalRecord[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/** Loads the settlement overview and the request history together. */
export function useSettlement(academyId: string | null, enabled = true): UseSettlementResult {
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [history, setHistory] = useState<WithdrawalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled || !academyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [nextSummary, nextHistory] = await Promise.all([
        settlementApi.getSummary(academyId),
        settlementApi.getHistory(),
      ]);
      setSummary(nextSummary);
      setHistory(Array.isArray(nextHistory) ? nextHistory : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, academyId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, history, isLoading, error, reload };
}
