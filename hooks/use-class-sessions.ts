'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { ClassSession } from '@/types/learning-operations';

/**
 * The meetings of one class. Homework hangs off the same list, so both the
 * timetable and the homework card read one copy instead of fetching twice.
 */
export function useClassSessions(groupId: string) {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    try {
      setSessions(await apiClient.getClassSessions(groupId));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = useCallback(
    (updated: ClassSession) =>
      setSessions((rows) =>
        rows.map((row) => (row.id === updated.id ? updated : row))
      ),
    []
  );

  return { sessions, isLoading, reload: load, replace };
}
