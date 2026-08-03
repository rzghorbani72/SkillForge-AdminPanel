import { z } from 'zod';
import { isValidEmail } from '@/lib/utils';
import { toE164Iran } from '@/lib/phone-utils';

export const MIN_PASSWORD_LENGTH = 6;
export const MIN_NAME_LENGTH = 2;
export const OTP_LENGTH = 5;

/** Translation key of the failing rule, or null when the value is valid. */
export type ValidationKey = string | null;
export type Translate = (key: string) => string;

export function validatePhone(value: string): ValidationKey {
  if (!value.trim()) return 'auth.phoneRequired';
  return /^\+989\d{9}$/.test(toE164Iran(value))
    ? null
    : 'auth.validPhoneNumber';
}

export function validateEmail(value: string): ValidationKey {
  if (!value.trim()) return 'auth.emailRequired';
  return isValidEmail(value.trim()) ? null : 'auth.invalidEmail';
}

export function validatePassword(value: string): ValidationKey {
  if (!value) return 'auth.passwordRequired';
  return value.length < MIN_PASSWORD_LENGTH ? 'auth.passwordTooShort' : null;
}

export function validateConfirmPassword(
  password: string,
  confirmation: string
): ValidationKey {
  if (!confirmation) return 'auth.confirmPasswordRequired';
  return password === confirmation ? null : 'auth.passwordsDoNotMatch';
}

export function validateFullName(value: string): ValidationKey {
  return value.trim().length < MIN_NAME_LENGTH ? 'auth.fullNameRequired' : null;
}

export function validateOtp(value: string): ValidationKey {
  if (!value.trim()) return 'auth.otpRequired';
  return value.trim().length < OTP_LENGTH ? 'auth.invalidOtp' : null;
}

/** Drops the valid fields and translates the failing ones for form state. */
export function collectErrors(
  fields: Record<string, ValidationKey>,
  t: Translate
): Record<string, string> {
  return Object.entries(fields).reduce<Record<string, string>>(
    (errors, [field, key]) => {
      if (key) errors[field] = t(key);
      return errors;
    },
    {}
  );
}

/** Same rules as above, wrapped for react-hook-form + zod screens. */
export function authField(
  validate: (value: string) => ValidationKey,
  t: Translate
) {
  return z.string().superRefine((value, ctx) => {
    const key = validate(value);
    if (key) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t(key) });
  });
}
