/**
 * A class slot is stored as a weekday plus minutes after local midnight, because
 * the first real date is unknown until the class fills. The UI still wants a
 * plain "09:30" box, so these two turn one into the other.
 */
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const timeToMinutes = (value: string): number => {
  const [h, m] = value.split(':').map((part) => Number(part));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return Math.min(Math.max(h * 60 + m, 0), 24 * 60 - 1);
};

/** The academy's own timezone, which is what the manager is picking days in. */
export const defaultTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tehran';
  } catch {
    return 'Asia/Tehran';
  }
};

/**
 * A class only gets `starts_on` when it is published, so a draft would look
 * undated even though the manager already picked a first day.
 */
export const termStart = (group: {
  starts_on?: string | null;
  starts_on_requested?: string | null;
}): string | null => group.starts_on ?? group.starts_on_requested ?? null;
