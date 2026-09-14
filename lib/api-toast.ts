import { toast } from 'react-toastify';
import { resolveApiErrorMessage } from './api-error';
import { currentLanguage } from './current-language';
import { t } from './i18n';

export { ApiResponseError } from './api-error';

/**
 * Success text is whatever the backend already localized for this request's
 * language. Errors go through `resolveApiErrorMessage`, which translates the
 * stable error code and can never fall through to English for a Persian user.
 */
function successMessage(response: unknown, fallback?: string): string {
  const body = response as Record<string, unknown> | null;
  const message = body?.message;
  if (typeof message === 'string' && message.length > 0) return message;
  return fallback ?? t('success.operationCompleted', currentLanguage());
}

export const apiToast = {
  success(response: unknown, fallback?: string) {
    const message = successMessage(response, fallback);
    toast.success(message, { toastId: `success:${message}` });
  },

  error(err: unknown, fallback?: string) {
    const message =
      resolveApiErrorMessage(err, currentLanguage()) ||
      fallback ||
      t('error.unexpected', currentLanguage());
    toast.error(message, { toastId: `error:${message}` });
  },
};
