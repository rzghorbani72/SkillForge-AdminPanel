'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type {
  TutoringGroup,
  TutoringGroupSlot,
  UpdateTutoringGroupPayload,
  CancelTutoringGroupPayload,
} from '@/types/learning-operations';

export function useClassDetail(groupId: string) {
  const [group, setGroup] = useState<TutoringGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Reloads after a write keep the form mounted; only the first fetch spins.
  const load = useCallback(async () => {
    try {
      setGroup(await apiClient.getTutoringGroup(groupId));
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Every write reloads, so the seat counter and status stay honest. */
  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      setBusy(true);
      try {
        await action();
        await load();
        return true;
      } catch (error) {
        ErrorHandler.handleApiError(error);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  return {
    group,
    loading,
    busy,
    reload: load,
    update: (data: UpdateTutoringGroupPayload) =>
      run(() => apiClient.updateTutoringGroup(groupId, data)),
    replaceSlots: (slots: TutoringGroupSlot[]) =>
      run(() => apiClient.replaceTutoringGroupSlots(groupId, slots)),
    publish: () => run(() => apiClient.publishTutoringGroup(groupId)),
    confirm: () => run(() => apiClient.confirmTutoringGroup(groupId)),
    cancel: (payload: CancelTutoringGroupPayload) =>
      run(() => apiClient.cancelTutoringGroup(groupId, payload)),
    updateLink: (url: string | null, notify: boolean, regenerate?: boolean) =>
      run(() => apiClient.updateTutoringGroupMeetingLink(groupId, url, notify, regenerate)),
    removeMember: (profileId: string) =>
      run(() => apiClient.removeTutoringGroupMember(groupId, profileId)),
    announce: (body: string, sendSms: boolean) =>
      run(() => apiClient.announceToTutoringGroup(groupId, body, sendSms)),
  };
}
