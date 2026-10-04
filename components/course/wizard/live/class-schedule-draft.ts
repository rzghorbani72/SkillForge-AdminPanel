import { previewSessionDates } from '@/lib/session-plan-preview';
import type { TutoringGroup, TutoringGroupSlot } from '@/types/learning-operations';

/** One class of the course: its own name and timetable. */
export interface ClassScheduleDraft {
  /** Server id once saved; null for a class that only exists in the wizard. */
  groupId: string | null;
  /** Stable React key, also for a class that has no id yet. */
  key: string;
  title: string;
  /** `YYYY-MM-DD` */
  startsOn: string;
  slots: TutoringGroupSlot[];
  sessionCount: string;
  /** `YYYY-MM-DDTHH:mm`, local time */
  joinDeadline: string;
}

export type ClassField = 'title' | 'startsOn' | 'slots' | 'sessionCount' | 'joinDeadline';
export type ClassErrors = Partial<Record<ClassField, string>>;

const MAX_SESSIONS = 200;

export const newClassDraft = (): ClassScheduleDraft => ({
  groupId: null,
  key: crypto.randomUUID(),
  title: '',
  startsOn: '',
  slots: [{ weekday: 6, start_minute: 18 * 60, duration_minutes: 90 }],
  sessionCount: '12',
  joinDeadline: '',
});

const pad = (value: number) => String(value).padStart(2, '0');

export const toLocalDateTime = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** Registration closes at the end of the day before the first class. */
export function defaultDeadline(startsOn: string): string {
  const day = new Date(`${startsOn}T23:59`);
  if (Number.isNaN(day.getTime())) return '';
  day.setDate(day.getDate() - 1);
  return toLocalDateTime(day);
}

export const classFromGroup = (group: TutoringGroup): ClassScheduleDraft => ({
  groupId: group.id,
  key: group.id,
  title: group.title,
  startsOn: group.starts_on_requested?.slice(0, 10) ?? '',
  slots: group.Slots ?? [],
  sessionCount: group.session_count ? String(group.session_count) : '',
  joinDeadline: group.join_deadline ? toLocalDateTime(new Date(group.join_deadline)) : '',
});

export function classSessionDates(schedule: ClassScheduleDraft, timezone: string): Date[] {
  const count = Number(schedule.sessionCount) || 0;
  const from = new Date(schedule.startsOn);
  if (!schedule.startsOn || Number.isNaN(from.getTime())) return [];
  return previewSessionDates(schedule.slots, Math.min(count, MAX_SESSIONS), from, timezone);
}

const sessionEnd = (start: Date, slots: readonly TutoringGroupSlot[]) => {
  const longest = Math.max(...slots.map((slot) => slot.duration_minutes), 0);
  return new Date(start.getTime() + longest * 60_000);
};

/** A name is needed only when there are several classes to tell apart. */
export function classErrors(
  schedule: ClassScheduleDraft,
  dates: readonly Date[],
  now: Date,
  nameRequired: boolean,
): ClassErrors {
  const errors: ClassErrors = {};
  const count = Number(schedule.sessionCount);
  const deadline = new Date(schedule.joinDeadline);
  const last = dates.at(-1);

  if (nameRequired && !schedule.title.trim()) errors.title = 'liveWizard.errClassName';
  if (!schedule.startsOn) errors.startsOn = 'liveWizard.errStartRequired';
  else if (new Date(`${schedule.startsOn}T23:59`) < now) {
    errors.startsOn = 'liveWizard.errStartPast';
  }
  if (schedule.slots.length === 0) errors.slots = 'liveWizard.errDaysRequired';
  else if (schedule.slots.some((slot) => slot.duration_minutes <= 0)) {
    errors.slots = 'tutoring.groups.endBeforeStart';
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_SESSIONS) {
    errors.sessionCount = 'liveWizard.errSessionsRequired';
  }
  if (schedule.joinDeadline) {
    if (Number.isNaN(deadline.getTime()) || deadline < now) {
      errors.joinDeadline = 'liveWizard.errDeadlinePast';
    } else if (last && deadline > sessionEnd(last, schedule.slots)) {
      errors.joinDeadline = 'liveWizard.errDeadlineAfterEnd';
    }
  }
  return errors;
}

/** Sessions a student who buys right at the deadline has already missed. */
export function sessionsMissedAtDeadline(
  schedule: ClassScheduleDraft,
  dates: readonly Date[],
): number {
  const deadline = new Date(schedule.joinDeadline);
  if (Number.isNaN(deadline.getTime())) return 0;
  return dates.filter((date) => date < deadline).length;
}
