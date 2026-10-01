'use client';

import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import {
  ACADEMY_RESCOPE_FLAG,
  getSelectedAcademyId,
  setSelectedAcademyId,
} from '@/lib/store-utils';
import type { Academy } from '@/types/api';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

/**
 * A staff session can carry no academy even though the user is a member of one
 * — the academy-less profile that manager signup creates is the usual source.
 * Every academy-scoped request then answers 401/403, so re-issue the token
 * against the academy they used last and reload once.
 */
export function useSessionAcademyRescope({
  enabled,
  academies,
}: {
  enabled: boolean;
  academies: Academy[];
}): void {
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !enabled || academies.length === 0) return;
    if (window.sessionStorage.getItem(ACADEMY_RESCOPE_FLAG)) return;

    attempted.current = true;
    window.sessionStorage.setItem(ACADEMY_RESCOPE_FLAG, '1');

    const selectedId = getSelectedAcademyId();
    const target = academies.find((a) => a.id === selectedId) ?? academies[0];

    const rescope = async () => {
      try {
        await apiClient.switchAcademy(target.id);
        setSelectedAcademyId(target.id);
        window.location.reload();
      } catch (error) {
        logger.error('Session', 'ScopeSessionToAnAcademyFailed', errorFields(error));
      }
    };

    void rescope();
  }, [enabled, academies]);
}
