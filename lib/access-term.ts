/**
 * Mirrors Backend/src/common/services/access-term.ts. Stating no term is not
 * "forever": the buyer gets the academy's active lifetime — its remaining paid
 * coverage, never under a year and never over the platform maximum — which is
 * still a concrete end date.
 */
export const MIN_SELLABLE_ACCESS_DAYS = 365;
export const PLATFORM_MAX_ACCESS_DAYS = 1825;

/**
 * The stated term in days, or null when nothing states one — null must be shown
 * as "as long as the academy is active", never as a number we invented.
 */
export function accessTermDays(
  offeringDays: number | null | undefined,
  courseDays: number | null | undefined
): number | null {
  return offeringDays ?? courseDays ?? null;
}
