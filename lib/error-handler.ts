import { toast } from 'react-toastify';
import { t } from './i18n';
import { currentLanguage } from './current-language';
import { isAuthPagePath } from './auth-routes';
import {
  isApiResponseError,
  resolveApiErrorMessage,
  resolveFieldLabel,
  resolveFieldMessage,
  type FieldError
} from './api-error';

/**
 * Displays backend errors.
 *
 * This used to reconstruct validation errors by splitting the message on commas
 * and matching English fragments like 'should not be empty'. That could only
 * ever work for an English response, so Persian users — the default — saw a
 * generic message and lost all field information. The backend now returns a
 * stable code plus a `fields` array, so all of that parsing is gone.
 */
export class ErrorHandler {
  /** Per-field toasts driven by the backend's `fields` array. */
  static handleValidationErrors(error: unknown): void {
    const language = currentLanguage();
    const fields = isApiResponseError(error) ? error.error.fields : [];

    if (fields.length > 0) {
      for (const fieldError of fields) {
        const message = resolveFieldMessage(fieldError, language);
        toast.error(message, { toastId: `error:${message}` });
      }
      return;
    }

    const message = resolveApiErrorMessage(error, language);
    toast.error(message, { toastId: `error:${message}` });
  }

  /**
   * 401 ends the session, so it redirects to login. 403 only means "you may not
   * do this" — we toast and stay on the page. Everything else falls through to
   * the validation toasts.
   */
  static handleApiError(error: unknown): void {
    const language = currentLanguage();
    const status = isApiResponseError(error) ? error.error.status : 0;

    if (status === 401) {
      if (typeof window === 'undefined') return;
      const message = resolveApiErrorMessage(error, language);
      toast.error(message, { toastId: `error:${message}` });
      const currentPath = window.location.pathname;
      if (!isAuthPagePath(currentPath)) {
        const target = currentPath + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(target)}`;
      }
      return;
    }

    if (status === 403) {
      if (typeof window === 'undefined') return;
      const message = resolveApiErrorMessage(error, language);
      toast.error(message, { toastId: `forbidden:${message}` });
      return;
    }

    if (status === 402) {
      if (typeof window === 'undefined') return;
      const message = resolveApiErrorMessage(error, language);
      toast.error(message, { toastId: `subscription:${message}` });
      return;
    }

    this.handleValidationErrors(error);
  }

  /**
   * Maps backend field errors onto form field names for inline display.
   * Anything unmapped is surfaced as a toast so it is never silently swallowed.
   */
  static handleFormError(error: unknown): Record<string, string> {
    const language = currentLanguage();
    const fieldErrors: Record<string, string> = {};
    const fields: FieldError[] = isApiResponseError(error)
      ? error.error.fields
      : [];

    for (const fieldError of fields) {
      const formField = this.mapFieldName(fieldError.field);
      if (formField) {
        fieldErrors[formField] = resolveFieldMessage(fieldError, language);
      }
    }

    if (Object.keys(fieldErrors).length === 0) {
      const message = resolveApiErrorMessage(error, language);
      toast.error(message, { toastId: `error:${message}` });
    }

    return fieldErrors;
  }

  /** Backend DTO field name -> the name the form uses for that input. */
  private static mapFieldName(field: string): string | null {
    const fieldMap: Record<string, string> = {
      phone_number: 'phone',
      confirmed_password: 'confirmPassword',
      otp: 'otp',
      password: 'password',
      email: 'email',
      name: 'name',
      role: 'role',
      academy_id: 'existingStoreId',
      display_name: 'name'
    };

    return fieldMap[field] ?? null;
  }

  /** Translated label for a backend field name. */
  static fieldLabel(field: string): string {
    return resolveFieldLabel(field, currentLanguage());
  }

  /**
   * Accepts either a translation key (e.g. 'success.loginSuccess') or ready text.
   */
  static showSuccess(message: string, useTranslation: boolean = false): void {
    const text = useTranslation ? t(message, currentLanguage()) : message;
    toast.success(text, { toastId: `success:${text}` });
  }

  static showInfo(message: string): void {
    toast.info(message, { toastId: `info:${message}` });
  }

  static showWarning(message: string): void {
    toast.warning(message, { toastId: `warning:${message}` });
  }

  static showError(message: string): void {
    toast.error(message, { toastId: `error:${message}` });
  }
}
