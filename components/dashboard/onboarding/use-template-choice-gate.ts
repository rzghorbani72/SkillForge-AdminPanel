'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logging/app-logger';
import type { TemplateChoice } from './template-choice-dialog';

const STORAGE_PREFIX = 'mentoma-template-choice:';

function readChoiceMade(academyId: string): boolean {
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}${academyId}`) === '1';
  } catch {
    return false;
  }
}

/**
 * A new academy already has an auto-picked template. The first time the
 * manager heads to their website we ask once — keep it or choose another —
 * and remember the answer per academy in this browser.
 */
export function useTemplateChoiceGate(academyId: string | null, enabled = true) {
  const [presetKey, setPresetKey] = useState<string | null>(null);
  // Starts as "made" so nothing is gated before storage and the API answer.
  const [choiceMade, setChoiceMade] = useState(true);

  useEffect(() => {
    if (!enabled || !academyId) return;
    let cancelled = false;
    void (async () => {
      const data = await apiClient.getCurrentUITemplate().catch(() => null);
      if (cancelled) return;
      setPresetKey((data as { template_preset?: string | null } | null)?.template_preset ?? null);
      setChoiceMade(readChoiceMade(academyId));
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, academyId]);

  const markChoiceMade = useCallback(
    (choice: TemplateChoice) => {
      if (!academyId) return;
      try {
        window.localStorage.setItem(`${STORAGE_PREFIX}${academyId}`, '1');
      } catch {
        // storage blocked: the dialog simply asks again next time
      }
      setChoiceMade(true);
      logger.ok('Onboarding', 'TemplateChoiceMade', { choice });
    },
    [academyId],
  );

  return {
    hasTemplate: !!presetKey,
    presetKey,
    shouldAsk: enabled && !!presetKey && !choiceMade,
    markChoiceMade,
  };
}
