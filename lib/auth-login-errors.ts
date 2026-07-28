import { isApiResponseError } from './api-error';

/**
 * True when login failed because no account exists, so the UI can route the
 * user to registration.
 *
 * This used to match English AND Persian substrings, because the response gave
 * no way to tell which language it had come back in. The backend now returns a
 * stable code.
 */
export function isUserNotRegisteredError(error: unknown): boolean {
  return (
    isApiResponseError(error) && error.error.code === 'AUTH_USER_NOT_REGISTERED'
  );
}
