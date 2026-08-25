import { CountryCode } from './country-codes';

export function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48)
    )
    .replace(/[٠-٩]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48)
    );
}

/** Converts ASCII digits (0-9) to Persian digits (۰-۹) for display. */
export function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) + 0x06f0 - 48)
  );
}

/**
 * E.164 or raw digits → spaced national Iranian mobile for display.
 * Example: +989120000000 → ۰۹۱۲ ۰۰۰ ۰۰۰۰ (LTR-isolated in fa).
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

/**
 * Phone or email → what the user should read. Emails pass through untouched;
 * phones are localised, so a Persian page never shows English digits.
 */
export function formatIdentifierDisplay(
  raw: string,
  language: string = 'fa'
): string {
  if (!raw) return '';
  if (raw.includes('@')) return raw;
  return formatPhoneDisplay(raw, language);
}

/**
 * Cleans a phone number by removing country codes, leading zeros, and invalid characters
 * @param phoneNumber - The raw phone number input
 * @param countryCode - The selected country code
 * @returns Cleaned phone number with only digits
 */
export const cleanPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): string => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Remove country code if it matches the selected country
  if (cleaned.startsWith(countryCode.dialCode.replace('+', ''))) {
    cleaned = cleaned.substring(countryCode.dialCode.replace('+', '').length);
  }

  // Remove leading zeros (common in many countries)
  cleaned = cleaned.replace(/^0+/, '');

  // Remove any remaining non-digit characters
  cleaned = cleaned.replace(/\D/g, '');

  return cleaned;
};

/**
 * Validates if a phone number is valid for the given country
 * @param phoneNumber - The cleaned phone number
 * @param countryCode - The selected country code
 * @returns True if the phone number is valid
 */
export const isValidPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): boolean => {
  if (!phoneNumber) return false;

  // Basic length validation (most phone numbers are 7-15 digits)
  if (phoneNumber.length < 7 || phoneNumber.length > 15) {
    return false;
  }

  // Country-specific validation patterns
  const patterns: Record<string, RegExp> = {
    US: /^\d{10}$/, // US: 10 digits
    CA: /^\d{10}$/, // Canada: 10 digits
    GB: /^\d{10,11}$/, // UK: 10-11 digits
    AU: /^\d{9,10}$/, // Australia: 9-10 digits
    DE: /^\d{10,12}$/, // Germany: 10-12 digits
    FR: /^\d{9,10}$/, // France: 9-10 digits
    IT: /^\d{9,10}$/, // Italy: 9-10 digits
    ES: /^\d{9}$/, // Spain: 9 digits
    IN: /^\d{10}$/, // India: 10 digits
    CN: /^\d{11}$/, // China: 11 digits
    JP: /^\d{10,11}$/, // Japan: 10-11 digits
    KR: /^\d{10,11}$/, // South Korea: 10-11 digits
    BR: /^\d{10,11}$/, // Brazil: 10-11 digits
    MX: /^\d{10}$/, // Mexico: 10 digits
    RU: /^\d{10}$/, // Russia: 10 digits
    IR: /^\d{10}$/, // Iran: 10 digits
    PK: /^\d{10}$/, // Pakistan: 10 digits
    BD: /^\d{10}$/, // Bangladesh: 10 digits
    TH: /^\d{9,10}$/, // Thailand: 9-10 digits
    VN: /^\d{9,10}$/, // Vietnam: 9-10 digits
    ID: /^\d{9,12}$/, // Indonesia: 9-12 digits
    MY: /^\d{9,10}$/, // Malaysia: 9-10 digits
    SG: /^\d{8}$/, // Singapore: 8 digits
    PH: /^\d{10}$/, // Philippines: 10 digits
    TW: /^\d{9,10}$/, // Taiwan: 9-10 digits
    HK: /^\d{8}$/, // Hong Kong: 8 digits
    NZ: /^\d{8,9}$/, // New Zealand: 8-9 digits
    ZA: /^\d{9}$/, // South Africa: 9 digits
    EG: /^\d{10}$/, // Egypt: 10 digits
    NG: /^\d{10,11}$/, // Nigeria: 10-11 digits
    KE: /^\d{9,10}$/, // Kenya: 9-10 digits
    MA: /^\d{9,10}$/, // Morocco: 9-10 digits
    TN: /^\d{8}$/, // Tunisia: 8 digits
    DZ: /^\d{9}$/, // Algeria: 9 digits
    SA: /^\d{9}$/, // Saudi Arabia: 9 digits
    AE: /^\d{9}$/, // UAE: 9 digits
    IL: /^\d{9,10}$/, // Israel: 9-10 digits
    LK: /^\d{9}$/ // Sri Lanka: 9 digits
  };

  const pattern = patterns[countryCode.code];
  if (pattern) {
    return pattern.test(phoneNumber);
  }

  // Default validation for countries not in the list
  return phoneNumber.length >= 7 && phoneNumber.length <= 15;
};

/**
 * Formats a phone number for display
 * @param phoneNumber - The cleaned phone number
 * @param countryCode - The selected country code
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): string => {
  if (!phoneNumber) return '';

  // Country-specific formatting
  const formatters: Record<string, (num: string) => string> = {
    US: (num) => {
      if (num.length === 10) {
        return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
      }
      return num;
    },
    CA: (num) => {
      if (num.length === 10) {
        return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
      }
      return num;
    },
    GB: (num) => {
      if (num.length === 10) {
        return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
      }
      return num;
    },
    AU: (num) => {
      if (num.length === 9) {
        return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
      }
      return num;
    },
    DE: (num) => {
      if (num.length >= 10) {
        return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
      }
      return num;
    },
    FR: (num) => {
      if (num.length === 10) {
        return `${num.slice(0, 2)} ${num.slice(2, 4)} ${num.slice(4, 6)} ${num.slice(6, 8)} ${num.slice(8)}`;
      }
      return num;
    },
    IN: (num) => {
      if (num.length === 10) {
        return `${num.slice(0, 5)} ${num.slice(5)}`;
      }
      return num;
    }
  };

  const formatter = formatters[countryCode.code];
  if (formatter) {
    return formatter(phoneNumber);
  }

  // Default formatting - add spaces every 3 digits
  return phoneNumber.replace(/(\d{3})(?=\d)/g, '$1 ');
};

/**
 * Gets the full international phone number
 * @param phoneNumber - The cleaned phone number
 * @param countryCode - The selected country code
 * @returns Full international phone number with country code
 */
export const getFullPhoneNumber = (
  phoneNumber: string,
  countryCode: CountryCode
): string => {
  if (!phoneNumber) return '';
  return `${countryCode.dialCode}${phoneNumber}`;
};

/**
 * Normalises any common Iranian phone format to E.164 (+98...).
 * 09xxxxxxxxx  → +989xxxxxxxxx
 * 9xxxxxxxxx   → +989xxxxxxxxx
 * 00989...     → +989...
 * +98...       → unchanged
 * other        → unchanged (pass through)
 */
export function toE164Iran(raw: string): string {
  const digits = toEnglishDigits(raw).replace(/\D/g, '');
  if (digits.startsWith('0098')) return '+' + digits.slice(2);
  if (digits.startsWith('98')) return '+' + digits;
  if (digits.startsWith('09')) return '+98' + digits.slice(1);
  if (digits.startsWith('9')) return '+98' + digits;
  return raw;
}
