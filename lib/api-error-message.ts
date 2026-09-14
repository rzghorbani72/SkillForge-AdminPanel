import { isApiResponseError, resolveApiErrorMessage } from '@/lib/api-error';
import { currentLanguage } from '@/lib/current-language';

/**
 * Display text for a caught request error, in the language the user picked.
 * Anything that is not an API error (network, coding bug) keeps the caller's
 * own fallback, which is more specific than a generic unknown-error text.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  return isApiResponseError(error) ? resolveApiErrorMessage(error, currentLanguage()) : fallback;
}
