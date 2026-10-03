'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logging/app-logger';
import type { TemplateChoice } from './template-choice-dialog';

/**
 * A new academy already has an auto-picked template. The first time the
 * manager heads to their website we ask once — keep it or choose another —
 * and remember the answer per manager and academy in the database.
 */
export function useTemplateChoiceGate(academyId: string | null, enabled = true) {
  const [presetKey, setPresetKey] = useState<string | null>(null);
  // Starts as "made" so nothing is gated before storage and the API answer.
  const [choiceMade, setChoiceMade] = useState(true);

  useEffect(() => {
    if (!enabled || !academyId) return;
    let cancelled = false;
    void (async () => {
      const [data, made] = await Promise.all([
        apiClient.getCurrentUITemplate().catch(() => null),
        apiClient.getTemplateChoiceMade().catch(() => true),
      ]);
      if (cancelled) return;
      const template = data as {
        template_preset?: string | null;
        draft_template_preset?: string | null;
      } | null;
      setPresetKey(template?.draft_template_preset ?? template?.template_preset ?? null);
      setChoiceMade(made);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, academyId]);

  const markChoiceMade = useCallback(
    (choice: TemplateChoice) => {
      if (!academyId) return;
      setChoiceMade(true);
      void apiClient.markTemplateChoiceMade().catch(() => undefined);
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
