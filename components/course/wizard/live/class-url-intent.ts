import type { ClassRequestWindow, TutoringGroupSlot } from '@/types/learning-operations';

/** `?new=1` on the schedule step adds an empty class. */
export const NEW_CLASS_PARAM = 'new';
/** `?request=<id>` adds a class prefilled from that class request. */
export const REQUEST_PARAM = 'request';

export const scheduleStepHref = (courseId: string, query = ''): string =>
  `/courses/${courseId}/edit?step=schedule${query ? `&${query}` : ''}`;

/** A requested window becomes a weekly slot starting at its start time. */
export const requestSlots = (windows: readonly ClassRequestWindow[]): TutoringGroupSlot[] =>
  windows.map((window) => ({
    weekday: window.weekday,
    start_minute: window.start_minute,
    duration_minutes: Math.max(30, Math.min(180, window.end_minute - window.start_minute)),
  }));
