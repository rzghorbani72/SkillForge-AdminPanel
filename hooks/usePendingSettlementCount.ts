'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformStaff } from '@/lib/roles';

const REFRESH_MS = 60_000;

/** Settlement requests waiting for staff; 0 for everyone who is not staff. */
export function usePendingSettlementCount(): number {
  const { user } = useAuthUser();
  const staff = isPlatformStaff(user);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!staff) return;
    let cancelled = false;
    const refresh = async () => {
      const next = await apiClient.getPendingSettlementCount().catch(() => 0);
      if (!cancelled) setCount(next);
    };
    void refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [staff]);

  return staff ? count : 0;
}
