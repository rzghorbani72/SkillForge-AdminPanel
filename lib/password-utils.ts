import { toEnglishDigits } from '@/lib/phone-utils';

const LOWER = 'abcdefghjkmnpqrstuvwxyz'; // no i/l/o — avoid look-alikes
const UPPER = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const DIGITS = '23456789'; // no 0/1 — avoid look-alikes
const ALL = LOWER + UPPER + DIGITS;

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
 * satisfies the app's strength rule (letter + digit, 6+ chars) and avoids
 * visually ambiguous characters so it's easy to read aloud or retype.
 */
export function generateTempPassword(length = 10): string {
  const required = [randomChar(LOWER), randomChar(UPPER), randomChar(DIGITS)];
  const rest = Array.from({ length: length - required.length }, () =>
    randomChar(ALL)
  );
  return shuffle([...required, ...rest]).join('');
}
