/** Persian (U+06F0) and Arabic-Indic (U+0660) digits → ASCII. */
export function toEnglishDigits(str: string): string {
  return str
    .replace(/[\u06F0-\u06F9]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48)
    )
    .replace(/[\u0660-\u0669]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48)
    );
}

/** ASCII digits (0-9) → Persian digits for display. */
export function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) + 0x06f0 - 48)
  );
}

/**
 * E.164 or raw digits → spaced national Iranian mobile for display.
 * Example: +989120000000 → 0912 000 0000 (Persian digits when language is fa).
 */
export function formatPhoneDisplay(
  raw: string,
  language: string = 'fa'
): string {
  if (!raw) return '—';

  let digits = toEnglishDigits(raw).replace(/\D/g, '');
  if (digits.startsWith('0098')) digits = digits.slice(4);
  else if (digits.startsWith('98')) digits = digits.slice(2);

  let national = digits;
  if (digits.length === 10 && digits.startsWith('9')) {
    national = `0${digits}`;
  }

  let formatted = national;
  if (national.length === 11 && national.startsWith('09')) {
    formatted = `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
  } else {
    formatted = national.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }

  if (language === 'fa') {
    return `\u2066${toPersianDigits(formatted)}\u2069`;
  }
  return formatted;
}

/** Phone or email → what the user should read. Emails pass through. */
export function formatIdentifierDisplay(
  raw: string,
  language: string = 'fa'
): string {
  if (!raw) return '';
  if (raw.includes('@')) return raw;
  return formatPhoneDisplay(raw, language);
}
