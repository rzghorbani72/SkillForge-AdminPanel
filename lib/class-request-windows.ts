import type { ClassRequestWindow } from '@/types/learning-operations';

const WEEKDAY_KEYS = [
  'weekdays.sunday',
  'weekdays.monday',
  'weekdays.tuesday',
  'weekdays.wednesday',
  'weekdays.thursday',
  'weekdays.friday',
  'weekdays.saturday'
];

const minuteLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

/** "Saturday 16:00–18:00 · Monday 10:00–12:00" in the panel's language. */
export const formatRequestWindows = (
  windows: readonly ClassRequestWindow[],
  t: (key: string) => string
): string =>
  windows
    .map(
      (w) =>
        `${t(WEEKDAY_KEYS[w.weekday])} ${minuteLabel(w.start_minute)}–${minuteLabel(w.end_minute)}`
    )
    .join(' · ');
