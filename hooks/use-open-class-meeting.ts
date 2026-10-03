'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { ClassJoinTarget } from '@/types/learning-operations';

/**
 * Our Meet server only accepts a link the API has signed for this person and
 * this class window, so the raw room URL can never be opened directly. The tab
 * opens on the click itself, before the await, so popup blockers allow it.
 */
export function useOpenClassMeeting(target: ClassJoinTarget | null) {
  const { t } = useTranslation();
  const [opening, setOpening] = useState(false);

  const open = async () => {
    if (!target) return;
    const tab = window.open('', '_blank');
    setOpening(true);
    try {
      const { meeting_url } = await apiClient.getClassJoinLink(target);
      if (meeting_url && tab) {
        tab.opener = null;
        tab.location.href = meeting_url;
        return;
      }
      tab?.close();
      if (!meeting_url) toast.info(t('courses.live.linkNotOpenYet'));
    } catch (error) {
      tab?.close();
      ErrorHandler.handleApiError(error);
    } finally {
      setOpening(false);
    }
  };

  return { open, opening };
}
