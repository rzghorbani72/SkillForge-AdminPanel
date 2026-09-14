'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import {
  EMPTY_MANAGER_DASHBOARD,
  type DashboardPeriodKey,
  type ManagerDashboard,
} from '@/types/dashboard';

/**
 * The money side of the dashboard. Every figure is aggregated by the API, so
 * the browser never pages through payments to add them up.
 */
export function useManagerMoney(period: DashboardPeriodKey) {
  const { selectedAcademy, isLoading: storeLoading } = useStore();
  const academyId = selectedAcademy?.id ?? null;
  const [data, setData] = useState<ManagerDashboard>(EMPTY_MANAGER_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const result = await apiClient.getManagerDashboard(period);
        if (!cancelled && result) setData(result);
      } catch {
        if (!cancelled) setData(EMPTY_MANAGER_DASHBOARD);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (!academyId) {
      if (!storeLoading) setIsLoading(false);
      return;
    }
    void load();

    return () => {
      cancelled = true;
    };
  }, [academyId, period, storeLoading, version]);

  return { ...data, isLoading, reload };
}
