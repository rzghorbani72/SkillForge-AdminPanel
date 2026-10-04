import { MAX_CLASS_CAPACITY } from '@/lib/live-room';
import type { CreateTutoringGroupPayload, TutoringGroup } from '@/types/learning-operations';
import {
  classFromGroup,
  newClassDraft,
  type ClassErrors,
  type ClassScheduleDraft,
} from './class-schedule-draft';

export type LiveClassKind = 'GROUP' | 'PRIVATE';
export type MeetingChoice = 'AUTO' | 'OWN';

/** The course's classes; kind, price, seats and meeting are shared by all of them. */
export interface LiveClassDraft {
  classes: ClassScheduleDraft[];
  kind: LiveClassKind;
  /** Seat price for a group class, whole-course price for a private one. */
  price: string;
  capacity: string;
  meeting: MeetingChoice;
  meetingUrl: string;
}

export type SharedField = 'price' | 'capacity' | 'meetingUrl';
export type SharedErrors = Partial<Record<SharedField, string>>;

export interface LiveDraftErrors {
  shared: SharedErrors;
  classes: ClassErrors[];
}

export const STEP_FIELDS = {
  classType: ['price', 'capacity'],
  meeting: ['meetingUrl'],
} as const satisfies Record<string, readonly SharedField[]>;

export type LiveClassStepName = 'schedule' | keyof typeof STEP_FIELDS;

export function stepHasErrors(errors: LiveDraftErrors, step: LiveClassStepName): boolean {
  if (step === 'schedule') return errors.classes.some((item) => Object.keys(item).length > 0);
  return STEP_FIELDS[step].some((field) => errors.shared[field] !== undefined);
}

export const emptyLiveDraft = (): LiveClassDraft => ({
  classes: [newClassDraft()],
  kind: 'GROUP',
  price: '',
  capacity: '12',
  meeting: 'AUTO',
  meetingUrl: '',
});

/** Shared settings are read from the first class; every save writes them to all. */
export function draftFromGroups(groups: readonly TutoringGroup[]): LiveClassDraft {
  const [first] = groups;
  const isPrivate = first.capacity === 1;
  return {
    classes: groups.map(classFromGroup),
    kind: isPrivate ? 'PRIVATE' : 'GROUP',
    price: String(first.seat_price ?? first.Offer?.price ?? ''),
    capacity: String(first.capacity),
    meeting: first.meeting_url && first.meeting_url_source === 'MANUAL' ? 'OWN' : 'AUTO',
    meetingUrl: first.meeting_url_source === 'MANUAL' ? (first.meeting_url ?? '') : '',
  };
}

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

export function sharedErrors(draft: LiveClassDraft): SharedErrors {
  const errors: SharedErrors = {};
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

export const seatCount = (draft: LiveClassDraft): number =>
  draft.kind === 'PRIVATE' ? 1 : Number(draft.capacity) || 1;

export type GroupWrite = Omit<CreateTutoringGroupPayload, 'offer_id'>;

/** An unnamed class (only possible when it is the only one) is named after the course. */
export function groupWrite(
  draft: LiveClassDraft,
  schedule: ClassScheduleDraft,
  courseTitle: string,
  timezone: string,
): GroupWrite {
  return {
    title: schedule.title.trim() || courseTitle,
    timezone,
    capacity: seatCount(draft),
    min_students: 1,
    seat_price: Number(draft.price),
    visibility: 'PUBLIC',
    session_count: Number(schedule.sessionCount),
    starts_on_requested: new Date(schedule.startsOn).toISOString(),
    join_deadline: schedule.joinDeadline
      ? new Date(schedule.joinDeadline).toISOString()
      : undefined,
    slots: schedule.slots,
  };
}
