import type { ClassSession } from '@/types/learning-operations';

export interface ClassProgress {
  total: number;
  done: number;
  remaining: number;
  /** The meeting happening right now, if any — it outranks "next" in the UI. */
  current: ClassSession | null;
  next: ClassSession | null;
}

const endOf = (session: ClassSession): number => {
  const start = new Date(session.starts_at).getTime();
  const end = session.ends_at ? new Date(session.ends_at).getTime() : null;
  return end && end > start ? end : start + 60 * 60 * 1000;
};

/**
 * Where a class stands right now. A teacher opens this page to answer "which
 * meeting is next and how many are left", so both are counted here once
 * instead of being re-derived by every card that shows them.
 */
export const classProgress = (sessions: ClassSession[], now: Date = new Date()): ClassProgress => {
  const at = now.getTime();
  const active = sessions
    .filter((session) => session.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const current =
    active.find((session) => new Date(session.starts_at).getTime() <= at && endOf(session) >= at) ??
    null;
  const done = active.filter((session) => endOf(session) < at).length;
  const next = active.find((session) => new Date(session.starts_at).getTime() > at) ?? null;

  return {
    total: active.length,
    done,
    remaining: Math.max(active.length - done, 0),
    current,
    next,
  };
};
