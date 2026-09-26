/** Mirrors Backend `live-room-limits.ts`: a 50-person Jitsi room minus teacher + observer. */
export const MAX_CLASS_CAPACITY = 48;

export const clampClassCapacity = (raw: string): string =>
  raw && Number(raw) > MAX_CLASS_CAPACITY ? String(MAX_CLASS_CAPACITY) : raw;
