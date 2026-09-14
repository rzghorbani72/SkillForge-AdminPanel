'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { TeacherBalance, TeacherPayoutRecord } from '@/types/teacher-earnings';

export function useTeacherEarnings() {
  const [balance, setBalance] = useState<TeacherBalance | null>(null);
  const [payouts, setPayouts] = useState<TeacherPayoutRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [nextBalance, nextPayouts] = await Promise.all([
          apiClient.getTeacherBalance(),
          apiClient.getTeacherPayoutRecords(),
        ]);
        if (cancelled) return;
        setBalance(nextBalance ?? null);
        setPayouts(Array.isArray(nextPayouts) ? nextPayouts : []);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { balance, payouts, isLoading, reload };
}
