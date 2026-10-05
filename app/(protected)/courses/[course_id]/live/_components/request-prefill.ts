import type {
  ClassRequest,
  ClassRequestWindow,
  TutoringGroupSlot,
} from '@/types/learning-operations';
import type { ScheduleBuilderPrefill } from '../hooks/use-schedule-builder';

/** `?request=<id>` opens the create form prefilled from that class request. */
export const REQUEST_PARAM = 'request';

/** A requested window becomes a weekly slot starting at its start time. */
const toSlots = (windows: ClassRequestWindow[]): TutoringGroupSlot[] =>
  windows.map((w) => ({
    weekday: w.weekday,
    start_minute: w.start_minute,
    duration_minutes: Math.max(30, Math.min(180, w.end_minute - w.start_minute)),
  }));

export const requestPrefill = (request: ClassRequest): ScheduleBuilderPrefill => ({
  slots: toSlots(request.windows),
  capacity: request.seats,
  minStudents: request.seats,
});
