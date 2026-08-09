'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export type UserStats = {
  total: number;
  active: number;
  teachers: number;
  pendingRequests: number;
};

const EMPTY_STATS: UserStats = {
  total: 0,
  active: 0,
  teachers: 0,
  pendingRequests: 0
};

/**
 * Real totals for the users header.
 *
 * Each number is the server's `pagination.total` for that filter, asked for one
 * row at a time. The page used to derive these from the rows it had already
 * loaded — so "teachers" only counted the current page, and "active" was
 * literally `total * 0.7`, a number that was never measured.
 */
export function useUserStats(): {
  stats: UserStats;
  refresh: () => Promise<void>;
} {
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);

  const refresh = useCallback(async () => {
    const totalOf = async (
      params: Parameters<typeof apiClient.getUsers>[0]
    ): Promise<number> => {
      const data = await apiClient.getUsers({ ...params, limit: 1 });
      return data?.pagination?.total ?? 0;
    };

    try {
      const [total, active, teachers, requests] = await Promise.all([
        totalOf({}),
        totalOf({ is_active: true }),
        totalOf({ role: 'TEACHER' }),
        apiClient.getTeacherRequests({ status: 'PENDING', limit: 1 })
      ]);

      setStats({
        total,
        active,
        teachers,
        pendingRequests: requests?.pagination?.total ?? 0
      });
    } catch {
      // Non-critical: the list itself still renders without the header counts.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, refresh };
}
