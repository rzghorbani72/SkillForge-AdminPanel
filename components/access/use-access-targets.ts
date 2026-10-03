'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { studentGroupsApi } from '@/lib/api-extra';
import type { SelectableEntity } from '@/components/shared/entity-multi-select';
import { useAuthUser } from '@/hooks/useAuthUser';

const STUDENT_PAGE_SIZE = 200;

type StudentRecord = {
  id?: string;
  display_name?: string | null;
  full_name?: string | null;
};

type UserListPayload = { users?: StudentRecord[]; profiles?: StudentRecord[] } | null;

function listRecords(payload: UserListPayload): StudentRecord[] {
  return payload?.users ?? payload?.profiles ?? [];
}

/**
 * The two things a manager can hand access to: individual students and student
 * groups. Loaded once per panel so the same lists back every assign surface.
 */
export function useAccessTargets(enabled: boolean) {
  const { user: authUser } = useAuthUser();
  const selfId = authUser?.id != null ? String(authUser.id) : '';
  const [students, setStudents] = useState<SelectableEntity[]>([]);
  const [groups, setGroups] = useState<SelectableEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // Plain USER members become STUDENT on grant; teachers keep their role.
      const [studentResponse, userResponse, teacherResponse, groupResponse] = await Promise.all([
        apiClient.getStudentUsers({ page: 1, limit: STUDENT_PAGE_SIZE }),
        apiClient.getUsers({ page: 1, limit: STUDENT_PAGE_SIZE, role: 'USER' }).catch(() => null),
        apiClient.getTeacherUsers({ page: 1, limit: STUDENT_PAGE_SIZE }).catch(() => null),
        studentGroupsApi.list(),
      ]);

      const seen = new Set<string>([selfId]);
      const records = [
        ...listRecords(studentResponse),
        ...listRecords(userResponse),
        ...listRecords(teacherResponse),
      ];
      setStudents(
        records
          .filter((record): record is StudentRecord & { id: string } => {
            if (!record.id || seen.has(record.id)) return false;
            seen.add(record.id);
            return true;
          })
          .map((record) => ({
            id: record.id,
            title: record.full_name || record.display_name || '—',
          })),
      );
      setGroups(
        (groupResponse?.data ?? []).map((group) => ({
          id: group.id,
          title: group.name,
        })),
      );
    } catch {
      setStudents([]);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [selfId]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  return { students, groups, isLoading, reload: load };
}
