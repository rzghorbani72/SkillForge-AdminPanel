import { MAX_CLASS_CAPACITY } from '@/lib/live-room';
import { previewSessionDates } from '@/lib/session-plan-preview';
import type {
  CreateTutoringGroupPayload,
  TutoringGroup,
  TutoringGroupSlot,
} from '@/types/learning-operations';

export type LiveClassKind = 'GROUP' | 'PRIVATE';
export type MeetingChoice = 'AUTO' | 'OWN';

export interface LiveClassDraft {
  /** `YYYY-MM-DD` */
  startsOn: string;
  slots: TutoringGroupSlot[];
  sessionCount: string;
  /** `YYYY-MM-DDTHH:mm`, local time */
  joinDeadline: string;
  kind: LiveClassKind;
  /** Seat price for a group class, whole-course price for a private one. */
  price: string;
  capacity: string;
  meeting: MeetingChoice;
  meetingUrl: string;
}

export type LiveDraftField =
  | 'startsOn'
  | 'slots'
  | 'sessionCount'
  | 'joinDeadline'
  | 'price'
  | 'capacity'
  | 'meetingUrl';

export type LiveDraftErrors = Partial<Record<LiveDraftField, string>>;

export const STEP_FIELDS = {
  schedule: ['startsOn', 'slots', 'sessionCount', 'joinDeadline'],
  classType: ['price', 'capacity'],
  meeting: ['meetingUrl'],
} as const satisfies Record<string, readonly LiveDraftField[]>;

const MAX_SESSIONS = 200;

export const stepHasErrors = (errors: LiveDraftErrors, step: keyof typeof STEP_FIELDS): boolean =>
  STEP_FIELDS[step].some((field) => errors[field] !== undefined);

export const EMPTY_LIVE_DRAFT: LiveClassDraft = {
  startsOn: '',
  slots: [{ weekday: 6, start_minute: 18 * 60, duration_minutes: 90 }],
  sessionCount: '12',
  joinDeadline: '',
  kind: 'GROUP',
  price: '',
  capacity: '12',
  meeting: 'AUTO',
  meetingUrl: '',
};

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

export function draftFromGroup(group: TutoringGroup): LiveClassDraft {
  const isPrivate = group.capacity === 1;
  return {
    startsOn: group.starts_on_requested?.slice(0, 10) ?? '',
    slots: group.Slots ?? [],
    sessionCount: group.session_count ? String(group.session_count) : '',
    joinDeadline: group.join_deadline ? toLocalDateTime(new Date(group.join_deadline)) : '',
    kind: isPrivate ? 'PRIVATE' : 'GROUP',
    price: String(group.seat_price ?? group.Offer?.price ?? ''),
    capacity: String(group.capacity),
    meeting: group.meeting_url && group.meeting_url_source === 'MANUAL' ? 'OWN' : 'AUTO',
    meetingUrl: group.meeting_url_source === 'MANUAL' ? (group.meeting_url ?? '') : '',
  };
}

export function sessionDates(draft: LiveClassDraft, timezone: string): Date[] {
  const count = Number(draft.sessionCount) || 0;
  const from = new Date(draft.startsOn);
  if (!draft.startsOn || Number.isNaN(from.getTime())) return [];
  return previewSessionDates(draft.slots, Math.min(count, MAX_SESSIONS), from, timezone);
}

const sessionEnd = (start: Date, slots: readonly TutoringGroupSlot[]) => {
  const longest = Math.max(...slots.map((slot) => slot.duration_minutes), 0);
  return new Date(start.getTime() + longest * 60_000);
};

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

/** Every problem that blocks saving, keyed by field; values are i18n keys. */
export function draftErrors(
  draft: LiveClassDraft,
  dates: readonly Date[],
  now: Date,
  scheduleLocked = false,
): LiveDraftErrors {
  const errors: LiveDraftErrors = scheduleLocked ? {} : scheduleErrors(draft, dates, now);

  const price = Number(draft.price);
  if (draft.price === '' || !Number.isFinite(price) || price < 0) {
    errors.price = 'liveWizard.errPriceRequired';
  }
  const capacity = Number(draft.capacity);
  const capacityOk = Number.isInteger(capacity) && capacity >= 2 && capacity <= MAX_CLASS_CAPACITY;
  if (draft.kind === 'GROUP' && !capacityOk) errors.capacity = 'liveWizard.errCapacity';
  if (draft.meeting === 'OWN' && !isHttpsUrl(draft.meetingUrl.trim())) {
    errors.meetingUrl = 'liveWizard.errMeetingUrl';
  }
  return errors;
}

function scheduleErrors(draft: LiveClassDraft, dates: readonly Date[], now: Date): LiveDraftErrors {
  const errors: LiveDraftErrors = {};
  const count = Number(draft.sessionCount);
  const deadline = new Date(draft.joinDeadline);
  const last = dates.at(-1);

  if (!draft.startsOn) errors.startsOn = 'liveWizard.errStartRequired';
  else if (new Date(`${draft.startsOn}T23:59`) < now) errors.startsOn = 'liveWizard.errStartPast';
  if (draft.slots.length === 0) errors.slots = 'liveWizard.errDaysRequired';
  else if (draft.slots.some((slot) => slot.duration_minutes <= 0)) {
    errors.slots = 'tutoring.groups.endBeforeStart';
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_SESSIONS) {
    errors.sessionCount = 'liveWizard.errSessionsRequired';
  }
  if (!draft.joinDeadline || Number.isNaN(deadline.getTime())) {
    errors.joinDeadline = 'liveWizard.errDeadlineRequired';
  } else if (deadline < now) {
    errors.joinDeadline = 'liveWizard.errDeadlinePast';
  } else if (last && deadline > sessionEnd(last, draft.slots)) {
    errors.joinDeadline = 'liveWizard.errDeadlineAfterEnd';
  }
  return errors;
}

/** Sessions a student who buys right at the deadline has already missed. */
export function sessionsMissedAtDeadline(draft: LiveClassDraft, dates: readonly Date[]): number {
  const deadline = new Date(draft.joinDeadline);
  if (Number.isNaN(deadline.getTime())) return 0;
  return dates.filter((date) => date < deadline).length;
}

export const seatCount = (draft: LiveClassDraft): number =>
  draft.kind === 'PRIVATE' ? 1 : Number(draft.capacity) || 1;

export type GroupWrite = Omit<CreateTutoringGroupPayload, 'offer_id'>;

export function groupWrite(draft: LiveClassDraft, title: string, timezone: string): GroupWrite {
  const seats = seatCount(draft);
  return {
    title,
    timezone,
    capacity: seats,
    min_students: 1,
    seat_price: Number(draft.price),
    visibility: 'PUBLIC',
    session_count: Number(draft.sessionCount),
    starts_on_requested: new Date(draft.startsOn).toISOString(),
    join_deadline: new Date(draft.joinDeadline).toISOString(),
    slots: draft.slots,
  };
}
