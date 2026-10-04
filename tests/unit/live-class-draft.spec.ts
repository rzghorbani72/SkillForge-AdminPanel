import { expect, test } from '@playwright/test';
import {
  classErrors,
  classSessionDates,
  defaultDeadline,
  newClassDraft,
  sessionsMissedAtDeadline,
  type ClassScheduleDraft,
} from '@/components/course/wizard/live/class-schedule-draft';
import {
  emptyLiveDraft,
  groupWrite,
  sharedErrors,
  type LiveClassDraft,
} from '@/components/course/wizard/live/live-class-draft';

const TZ = 'Asia/Tehran';
const NOW = new Date('2026-10-04T08:00:00Z');

// Saturday, Monday, Wednesday 18:00–20:00, 12 sessions from Sat 10 Oct 2026.
const READY_CLASS: ClassScheduleDraft = {
  ...newClassDraft(),
  startsOn: '2026-10-10',
  slots: [6, 1, 3].map((weekday) => ({ weekday, start_minute: 18 * 60, duration_minutes: 120 })),
  sessionCount: '12',
  joinDeadline: '2026-10-09T23:59',
};

const READY: LiveClassDraft = {
  ...emptyLiveDraft(),
  classes: [READY_CLASS],
  price: '1000000',
  capacity: '12',
};

const errorsOf = (schedule: ClassScheduleDraft, nameRequired = false) =>
  classErrors(schedule, classSessionDates(schedule, TZ), NOW, nameRequired);

test('a complete group class has no errors', () => {
  expect(errorsOf(READY_CLASS)).toEqual({});
  expect(sharedErrors(READY)).toEqual({});
});

test('session dates follow the weekly days and stop at the count', () => {
  const dates = classSessionDates(READY_CLASS, TZ);
  expect(dates).toHaveLength(12);
  expect(dates[0].toISOString()).toBe('2026-10-10T14:30:00.000Z');
  expect(dates.at(-1)?.toISOString()).toBe('2026-11-04T14:30:00.000Z');
});

test('the default deadline is the end of the day before the start', () => {
  expect(defaultDeadline('2026-10-10')).toBe('2026-10-09T23:59');
});

test('a deadline after the last session is refused', () => {
  expect(errorsOf({ ...READY_CLASS, joinDeadline: '2026-11-08T23:59' }).joinDeadline).toBe(
    'liveWizard.errDeadlineAfterEnd',
  );
});

test('a day whose end time is not after its start is refused', () => {
  const [first, ...rest] = READY_CLASS.slots;
  const broken = { ...READY_CLASS, slots: [{ ...first, duration_minutes: -60 }, ...rest] };
  expect(errorsOf(broken).slots).toBe('tutoring.groups.endBeforeStart');
});

test('a deadline after the start is allowed but counts missed sessions', () => {
  const late = { ...READY_CLASS, joinDeadline: '2026-10-17T12:00' };
  expect(errorsOf(late).joinDeadline).toBeUndefined();
  expect(sessionsMissedAtDeadline(late, classSessionDates(late, TZ))).toBe(3);
});

test('missing schedule fields are reported per field', () => {
  const errors = errorsOf({ ...newClassDraft(), slots: [], sessionCount: '' });
  expect(Object.keys(errors).sort()).toEqual(['sessionCount', 'slots', 'startsOn']);
});

test('missing price and an insecure link are reported', () => {
  const errors = sharedErrors({
    ...emptyLiveDraft(),
    meeting: 'OWN',
    meetingUrl: 'http://not-secure.example',
  });
  expect(Object.keys(errors).sort()).toEqual(['meetingUrl', 'price']);
});

test('a name is required only when the course has several classes', () => {
  expect(errorsOf(READY_CLASS).title).toBeUndefined();
  expect(errorsOf(READY_CLASS, true).title).toBe('liveWizard.errClassName');
  expect(errorsOf({ ...READY_CLASS, title: 'Morning' }, true).title).toBeUndefined();
});

test('an unnamed class is named after the course', () => {
  expect(groupWrite(READY, READY_CLASS, 'English', TZ).title).toBe('English');
  expect(groupWrite(READY, { ...READY_CLASS, title: ' Evening ' }, 'English', TZ).title).toBe(
    'Evening',
  );
});

test('a private class is one seat at the whole-course price', () => {
  const draft: LiveClassDraft = { ...READY, kind: 'PRIVATE', price: '5000000' };
  const write = groupWrite(draft, READY_CLASS, 'English', TZ);
  expect(write.capacity).toBe(1);
  expect(write.seat_price).toBe(5_000_000);
  expect(write.visibility).toBe('PUBLIC');
});

test('a free class is valid', () => {
  expect(sharedErrors({ ...READY, price: '0' }).price).toBeUndefined();
});

test('a new class starts within the plan seat cap', () => {
  expect(emptyLiveDraft(10).capacity).toBe('10');
  expect(emptyLiveDraft().capacity).toBe('12');
});

test('more seats than the plan allows is refused', () => {
  expect(sharedErrors({ ...READY, capacity: '12' }, 10).capacity).toBe(
    'liveWizard.errCapacityOverPlan',
  );
  expect(sharedErrors({ ...READY, capacity: '10' }, 10).capacity).toBeUndefined();
});
