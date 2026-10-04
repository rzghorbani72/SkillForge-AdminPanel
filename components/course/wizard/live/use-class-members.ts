'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { TutoringGroupMember } from '@/types/learning-operations';

const isSeated = (member: TutoringGroupMember) =>
  member.status === 'PENDING' || member.status === 'ACTIVE';

/**
 * Who holds a seat in the class. Adding a student gives them a free seat, so
 * they can enter the class page — a course access grant alone does not.
 */
export function useClassMembers(groupId: string | null) {
  const [members, setMembers] = useState<TutoringGroupMember[]>([]);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!groupId) return;
    try {
      const group = await apiClient.getTutoringGroup(groupId);
      setMembers(group.members ?? []);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  }, [groupId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      await reload();
      setBusy(false);
    }
  };

  // One at a time: each add claims a seat, and a full class must stop the rest.
  const add = (profileIds: readonly string[]) =>
    run(async () => {
      if (!groupId) return;
      for (const profileId of profileIds) {
        await apiClient.addTutoringGroupMember(groupId, profileId);
      }
    });

  const remove = (profileId: string) =>
    run(async () => {
      if (groupId) await apiClient.removeTutoringGroupMember(groupId, profileId);
    });

  const memberIds = members.flatMap((member) =>
    isSeated(member) && member.Student ? [member.Student.id] : [],
  );

  return { members, memberIds, busy, add, remove };
}
