'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { CancelClassPreview } from '@/types/learning-operations';

const NONE = 'none';

export function useCancelPreview(groupId: string) {
  const [preview, setPreview] = useState<CancelClassPreview | null>(null);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [inviteGroupId, setInviteGroupId] = useState(NONE);

  useEffect(() => {
    let cancelled = false;
    void apiClient
      .getCancelClassPreview(groupId)
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
        setInvited(
          new Set(
            data.members.filter((row) => row.credit <= 0).map((row) => row.student_profile_id),
          ),
        );
        setInviteGroupId(data.invite_groups.find((row) => row.seats_left > 0)?.id ?? NONE);
      })
      .catch((err: unknown) => ErrorHandler.handleApiError(err));
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  return { preview, invited, setInvited, inviteGroupId, setInviteGroupId, none: NONE };
}
