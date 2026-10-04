/** Mirrors Backend `live-room-limits.ts`: a 50-person Jitsi room minus teacher + observer. */
export const MAX_CLASS_CAPACITY = 48;

/** The plan may allow fewer seats per class than the room holds. */
export const classCapacityLimit = (planLimit?: number | null): number =>
  Math.min(MAX_CLASS_CAPACITY, planLimit ?? MAX_CLASS_CAPACITY);

export const clampClassCapacity = (raw: string): string =>
  raw && Number(raw) > MAX_CLASS_CAPACITY ? String(MAX_CLASS_CAPACITY) : raw;
