import { expect, test } from '@playwright/test';
import {
  EMPTY_LIVE_DRAFT,
  defaultDeadline,
  draftErrors,
  groupWrite,
  sessionDates,
  sessionsMissedAtDeadline,
  type LiveClassDraft,
} from '@/components/course/wizard/live/live-class-draft';

const TZ = 'Asia/Tehran';
const NOW = new Date('2026-10-04T08:00:00Z');

// Saturday, Monday, Wednesday 18:00–20:00, 12 sessions from Sat 10 Oct 2026.
const READY: LiveClassDraft = {
  ...EMPTY_LIVE_DRAFT,
  startsOn: '2026-10-10',
  slots: [6, 1, 3].map((weekday) => ({ weekday, start_minute: 18 * 60, duration_minutes: 120 })),
  sessionCount: '12',
  joinDeadline: '2026-10-09T23:59',
  price: '1000000',
  capacity: '12',
};

const errorsOf = (draft: LiveClassDraft) => draftErrors(draft, sessionDates(draft, TZ), NOW);

test('a complete group class has no errors', () => {
  expect(errorsOf(READY)).toEqual({});
});

test('session dates follow the weekly days and stop at the count', () => {
  const dates = sessionDates(READY, TZ);
  expect(dates).toHaveLength(12);
  expect(dates[0].toISOString()).toBe('2026-10-10T14:30:00.000Z');
  expect(dates.at(-1)?.toISOString()).toBe('2026-11-04T14:30:00.000Z');
});

test('the default deadline is the end of the day before the start', () => {
  expect(defaultDeadline('2026-10-10')).toBe('2026-10-09T23:59');
});

test('a deadline after the last session is refused', () => {
  expect(errorsOf({ ...READY, joinDeadline: '2026-11-08T23:59' }).joinDeadline).toBe(
    'liveWizard.errDeadlineAfterEnd',
  );
});

test('a day whose end time is not after its start is refused', () => {
  const [first, ...rest] = READY.slots;
  const broken = { ...READY, slots: [{ ...first, duration_minutes: -60 }, ...rest] };
  expect(errorsOf(broken).slots).toBe('tutoring.groups.endBeforeStart');
});

test('a deadline after the start is allowed but counts missed sessions', () => {
  const late = { ...READY, joinDeadline: '2026-10-17T12:00' };
  expect(errorsOf(late).joinDeadline).toBeUndefined();
  expect(sessionsMissedAtDeadline(late, sessionDates(late, TZ))).toBe(3);
});

test('missing schedule, price and link are reported per field', () => {
  const errors = errorsOf({
    ...EMPTY_LIVE_DRAFT,
    slots: [],
    sessionCount: '',
    meeting: 'OWN',
    meetingUrl: 'http://not-secure.example',
  });
  expect(Object.keys(errors).sort()).toEqual(
    ['joinDeadline', 'meetingUrl', 'price', 'sessionCount', 'slots', 'startsOn'].sort(),
  );
});

test('a locked schedule skips date checks but still checks the price', () => {
  const errors = draftErrors({ ...READY, startsOn: '2026-01-01', price: '' }, [], NOW, true);
  expect(errors).toEqual({ price: 'liveWizard.errPriceRequired' });
});

test('a private class is one seat at the whole-course price', () => {
  const write = groupWrite({ ...READY, kind: 'PRIVATE', price: '5000000' }, 'English', TZ);
  expect(write.capacity).toBe(1);
  expect(write.seat_price).toBe(5_000_000);
  expect(write.visibility).toBe('PUBLIC');
});

test('a free class is valid', () => {
  expect(errorsOf({ ...READY, price: '0' }).price).toBeUndefined();
});
