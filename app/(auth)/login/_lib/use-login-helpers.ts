import { isUserNotRegisteredError } from '@/lib/auth-login-errors';
import { apiErrorMessage } from '@/lib/api-error-message';

export type Academy = { id: string; name: string; slug: string };

export type LoginResponse = {
  /** The role the backend put in the JWT — the only one the request proxy agrees with. */
  roles?: string[];
  currentProfile?: { Role?: { name?: string }; academy_id?: string };
  currentAcademy?: unknown;
  phone_verification_required?: boolean;
  password_reset_required?: boolean;
  temp_token?: string;
  /** Masked, for display only. */
  phone?: string;
  /** Real E.164 — what the OTP endpoints must be called with. */
  full_phone?: string;
  /** Debug code, only while no real SMS provider is delivering it. */
  availableAcademies?: Academy[];
  available_academies?: Academy[];
  requires_academy_selection?: boolean;
};

export function goToUnauthorized() {
  if (typeof window === 'undefined') return;
  window.location.assign('/unauthorized');
}

export function resolveLoginError(
  error: unknown,
  fallback: string,
  notRegisteredMessage: string,
): { message: string; registrationRequired: boolean } {
  const registrationRequired = isUserNotRegisteredError(error);
  return {
    message: registrationRequired ? notRegisteredMessage : apiErrorMessage(error, fallback),
    registrationRequired,
  };
}
