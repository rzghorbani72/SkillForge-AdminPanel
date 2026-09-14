import type { TutoringGroup, TutoringGroupStatus } from '@/types/learning-operations';

/** A class that is selling seats or already teaching — not a draft or an archive. */
const LIVE_STATUSES: readonly TutoringGroupStatus[] = ['WAITING', 'CONFIRMED', 'RUNNING'];

export function activeClassCount(groups: readonly TutoringGroup[]): number {
  return groups.filter((group) => LIVE_STATUSES.includes(group.status)).length;
}

export interface SeatTotals {
  taken: number;
  capacity: number;
  /** 0–100, `null` when no class has seats yet so the UI can hide the bar. */
  fillPercent: number | null;
}

export function seatTotals(groups: readonly TutoringGroup[]): SeatTotals {
  const live = groups.filter((group) => LIVE_STATUSES.includes(group.status));
  const taken = live.reduce((sum, group) => sum + (group.seats_taken ?? 0), 0);
  const capacity = live.reduce((sum, group) => sum + (group.capacity ?? 0), 0);
  return {
    taken,
    capacity,
    fillPercent: capacity > 0 ? Math.round((taken / capacity) * 100) : null,
  };
}

/**
 * The class that starts soonest, which is what a teacher opens this page to
 * check. A class already running counts as "next" — its next meeting is closer
 * than any class that has not begun.
 */
export function nextClass(
  groups: readonly TutoringGroup[],
  now: Date = new Date(),
): TutoringGroup | null {
  const running = groups.find((group) => group.status === 'RUNNING');
  if (running) return running;

  const upcoming = groups
    .filter(
      (group) =>
        LIVE_STATUSES.includes(group.status) &&
        group.starts_on != null &&
        new Date(group.starts_on).getTime() >= now.getTime(),
    )
    .sort(
      (a, b) =>
        new Date(a.starts_on as string).getTime() - new Date(b.starts_on as string).getTime(),
    );

  return upcoming[0] ?? null;
}
