import { toEnglishDigits } from '@/lib/phone-utils';

const LOWER = 'abcdefghjkmnpqrstuvwxyz'; // no i/l/o — avoid look-alikes
const UPPER = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const DIGITS = '23456789'; // no 0/1 — avoid look-alikes
const SYMBOLS = '!@#$%*?-+'; // easy to read aloud and safe in every field
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

/** Printable ASCII (English letters, digits, symbols). */
const NON_ASCII_PRINTABLE = /[^\x20-\x7E]/g;

/**
 * Convert Persian/Arabic digits to English and drop any non-English character
 * so the password field never accepts Persian letters or other scripts.
 */
export function sanitizePasswordInput(value: string): string {
  return toEnglishDigits(value).replace(NON_ASCII_PRINTABLE, '');
}

export function isAsciiPassword(value: string): boolean {
  return !/[^\x20-\x7E]/.test(value);
}

export const MIN_PASSWORD_LENGTH = 6;

/** Printable ASCII that is neither a letter nor a digit, e.g. ! @ # $ % ? */
const SYMBOL = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/;

export interface PasswordChecks {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  const normalized = toEnglishDigits(password);
  return {
    minLength: normalized.length >= MIN_PASSWORD_LENGTH,
    hasLetter: /[a-zA-Z]/.test(normalized),
    hasNumber: /[0-9]/.test(normalized),
    hasSymbol: SYMBOL.test(normalized)
  };
}

export function isPasswordValid(password: string): boolean {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}

function randomChar(pool: string): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return pool[bytes[0] % pool.length];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const j = bytes[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * One-time password for an admin to hand to a newly created user. Always
 * satisfies the app's strength rule (letter + digit + symbol, 6+ chars) and
 * avoids visually ambiguous characters so it's easy to read aloud or retype.
 */
export function generateTempPassword(length = 10): string {
  const required = [
    randomChar(LOWER),
    randomChar(UPPER),
    randomChar(DIGITS),
    randomChar(SYMBOLS)
  ];
  const rest = Array.from({ length: length - required.length }, () =>
    randomChar(ALL)
  );
  return shuffle([...required, ...rest]).join('');
}

/**
 * Shortest password that passes isPasswordValid: 3 letters + 2 digits + "!".
 * Fixed order so it is easy to read aloud and type on a phone.
 */
export function generateSimpleTempPassword(): string {
  return (
    randomChar(LOWER) +
    randomChar(LOWER) +
    randomChar(LOWER) +
    randomChar(DIGITS) +
    randomChar(DIGITS) +
    '!'
  );
}
