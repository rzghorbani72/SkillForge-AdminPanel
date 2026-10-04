'use client';

import { useMemo } from 'react';

import type { TutoringGroup } from '@/types/learning-operations';
import {
  classErrors,
  classSessionDates,
  sessionsMissedAtDeadline,
  type ClassErrors,
  type ClassScheduleDraft,
} from './class-schedule-draft';
import { sharedErrors, type LiveClassDraft, type LiveDraftErrors } from './live-class-draft';
import { isScheduleEditable } from './persist-live-class';

/** One class as its schedule cards see it. */
export interface ClassScheduleApi {
  index: number;
  schedule: ClassScheduleDraft;
  group: TutoringGroup | null;
  dates: Date[];
  errors: ClassErrors;
  shownErrors: ClassErrors;
  locked: boolean;
  missedAtDeadline: number;
  update: (partial: Partial<ClassScheduleDraft>) => void;
}

/** Once a class has started, its dates are a promise and are not validated again here. */
export function useClassSchedules(
  draft: LiveClassDraft,
  groups: readonly TutoringGroup[],
  timezone: string,
  revealErrors: boolean,
  setClasses: (classes: ClassScheduleDraft[]) => void,
): { classes: ClassScheduleApi[]; errors: LiveDraftErrors } {
  const nameRequired = draft.classes.length > 1;
  const computed = useMemo(() => {
    const now = new Date();
    return draft.classes.map((schedule) => {
      const group = groups.find((item) => item.id === schedule.groupId) ?? null;
      const locked = !isScheduleEditable(group);
      const dates = classSessionDates(schedule, timezone);
      const lockedErrors: ClassErrors =
        nameRequired && !schedule.title.trim() ? { title: 'liveWizard.errClassName' } : {};
      const errors = locked ? lockedErrors : classErrors(schedule, dates, now, nameRequired);
      return { schedule, group, locked, dates, errors };
    });
  }, [draft.classes, groups, timezone, nameRequired]);

  const classes = computed.map((item, index) => ({
    ...item,
    index,
    shownErrors: revealErrors ? item.errors : {},
    missedAtDeadline: sessionsMissedAtDeadline(item.schedule, item.dates),
    update: (partial: Partial<ClassScheduleDraft>) =>
      setClasses(
        draft.classes.map((other) =>
          other.key === item.schedule.key ? { ...other, ...partial } : other,
        ),
      ),
  }));

  return {
    classes,
    errors: { shared: sharedErrors(draft), classes: computed.map((item) => item.errors) },
  };
}
