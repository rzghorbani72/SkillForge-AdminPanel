'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logging/app-logger';

export const SETUP_STEPS = ['website', 'template', 'course', 'visit'] as const;

export type SetupStepId = (typeof SETUP_STEPS)[number];

type StoredChecklist = {
  dismissed: boolean;
  done: Partial<Record<SetupStepId, boolean>>;
  /** Set when the trial flow lands with ?setup=1 so the banner stays until dismiss. */
  fromTrial: boolean;
};

const STORAGE_PREFIX = 'mentoma-setup-checklist:';

function storageKey(academyId: string): string {
  return `${STORAGE_PREFIX}${academyId}`;
}

function readStored(academyId: string): StoredChecklist {
  const empty: StoredChecklist = {
    dismissed: false,
    done: {},
    fromTrial: false,
  };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = window.localStorage.getItem(storageKey(academyId));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return empty;
    const record = parsed as Partial<StoredChecklist>;
    return {
      dismissed: record.dismissed === true,
      fromTrial: record.fromTrial === true,
      done: record.done && typeof record.done === 'object' ? record.done : {},
    };
  } catch {
    return empty;
  }
}

function writeStored(academyId: string, value: StoredChecklist): void {
  window.localStorage.setItem(storageKey(academyId), JSON.stringify(value));
}

type Args = {
  academyId: string | null;
  hasCourse: boolean;
  /** The academy already has a site template applied. */
  hasTemplate: boolean;
  enabled: boolean;
};

export function useSetupChecklist({ academyId, hasCourse, hasTemplate, enabled }: Args) {
  const searchParams = useSearchParams();
  const [stored, setStored] = useState<StoredChecklist | null>(null);

  useEffect(() => {
    if (!enabled || !academyId) {
      setStored(null);
      return;
    }
    const next = readStored(academyId);
    if (searchParams.get('setup') === '1') {
      next.fromTrial = true;
      next.dismissed = false;
      writeStored(academyId, next);
      const url = new URL(window.location.href);
      url.searchParams.delete('setup');
      window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    }
    setStored(next);
  }, [academyId, enabled, searchParams]);

  const persist = useCallback(
    (next: StoredChecklist) => {
      if (!academyId) return;
      writeStored(academyId, next);
      setStored(next);
    },
    [academyId],
  );

  // Template and course are checked off by real account state, not by having
  // clicked the step — so the banner is still right on a new device or browser.
  // A step also counts as done when any later step is done.
  const done = useMemo(() => {
    const marks = stored?.done ?? {};
    const own: Record<SetupStepId, boolean> = {
      website: marks.website === true,
      template: marks.template === true || hasTemplate,
      course: marks.course === true || hasCourse,
      visit: marks.visit === true,
    };
    return Object.fromEntries(
      SETUP_STEPS.map((step, index) => [step, SETUP_STEPS.slice(index).some((s) => own[s])]),
    ) as Record<SetupStepId, boolean>;
  }, [hasCourse, hasTemplate, stored]);

  const completedCount = SETUP_STEPS.filter((step) => done[step]).length;
  const allDone = completedCount === SETUP_STEPS.length;

  const visible =
    enabled &&
    !!academyId &&
    stored !== null &&
    !stored.dismissed &&
    !allDone &&
    (stored.fromTrial || !hasCourse);

  const markDone = useCallback(
    (step: SetupStepId) => {
      if (!stored) return;
      persist({
        ...stored,
        done: { ...stored.done, [step]: true },
      });
      logger.ok('Onboarding', 'SetupStepOpened', { step });
    },
    [persist, stored],
  );

  const dismiss = useCallback(() => {
    if (!stored) return;
    persist({ ...stored, dismissed: true });
    logger.ok('Onboarding', 'SetupBannerDismissed', {});
  }, [persist, stored]);

  return { visible, done, completedCount, markDone, dismiss };
}
