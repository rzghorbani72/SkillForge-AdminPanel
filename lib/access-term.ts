/**
 * Mirrors Backend/src/common/services/access-term.ts. No purchase is unbounded:
 * a blank term means the default, never "forever".
 */
export const DEFAULT_ACCESS_DAYS = 365;
export const PLATFORM_MAX_ACCESS_DAYS = 1825;

export function accessTermDays(
  offeringDays: number | null | undefined,
  courseDays: number | null | undefined
): number {
  return offeringDays ?? courseDays ?? DEFAULT_ACCESS_DAYS;
}
