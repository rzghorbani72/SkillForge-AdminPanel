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
  return isApiResponseError(error) && error.error.code === 'AUTH_USER_NOT_REGISTERED';
}

/**
 * True when the backend is asking for an hCaptcha token before it will
 * process another login attempt from this IP (repeated failures).
 */
export function isCaptchaRequiredError(error: unknown): boolean {
  return isApiResponseError(error) && error.error.code === 'CAPTCHA_REQUIRED';
}

const PANEL_BLOCKED_CODES = new Set([
  'AUTH_ACCOUNT_DISABLED',
  'AUTH_USER_BANNED',
  'AUTH_MEMBER_BANNED',
]);

/**
 * True when login (or a live session) failed because this panel account is
 * banned or deactivated. Those users go to `/unauthorized`, not back to login.
 */
export function isPanelAccessBlockedError(error: unknown): boolean {
  return isApiResponseError(error) && PANEL_BLOCKED_CODES.has(error.error.code);
}
