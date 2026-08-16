/**
 * Parsing and translating backend errors.
 *
 * The backend now returns a stable `code` alongside the localized `message`, so
 * the UI never has to sniff English prose to work out what went wrong.
 *
 * Keep this file semantically identical to edusphere/lib/api-error.ts.
 *
 * Persian-first rule: a `fa` user must NEVER be shown English. Every lookup
 * chain below terminates in a Persian string, and `messageEn` exists for
 * logging only — do not render it.
 */
import { getTranslations, DEFAULT_LANGUAGE, type LanguageCode } from './i18n';

export type FieldError = {
  field: string;
  code: string;
  params: Record<string, string | number>;
};

export type ApiError = {
  status: number;
  code: string;
  /** Already localized by the backend for the language the request was sent in. */
  message: string;
  /** For logs and Sentry only. Never render this. */
  messageEn: string;
  params: Record<string, string | number>;
  fields: FieldError[];
};

const PERSIAN_SCRIPT = /[؀-ۿ]/;
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

function interpolate(
  template: string,
  params: Record<string, string | number>,
  language: LanguageCode
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    if (value === undefined) return match;
    const text = String(value);
    return language === 'fa' ? toPersianDigits(text) : text;
  });
}

/**
 * Resolves a dotted key inside ONE language pack.
 *
 * Deliberately not `t()`: that falls back to the English pack on a miss, which
 * would put English in front of a Persian user.
 */
function lookup(language: LanguageCode, key: string): string | null {
  const keys = key.split('.');
  let value: unknown = getTranslations(language);
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return null;
    }
  }
  return typeof value === 'string' ? value : null;
}

/**
 * `ar`/`tr` are not translated yet and fall back to English — never to Persian,
 * which would be unreadable for those users.
 */
function lookupWithFallback(
  language: LanguageCode,
  key: string
): string | null {
  return (
    lookup(language, key) ?? (language === 'fa' ? null : lookup('en', key))
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseFields(raw: unknown): FieldError[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const row = asRecord(entry);
    if (!row || typeof row.field !== 'string' || typeof row.code !== 'string')
      return [];
    return [
      {
        field: row.field,
        code: row.code,
        params: (asRecord(row.params) ?? {}) as Record<string, string | number>
      }
    ];
  });
}

/**
 * A 502/504 usually comes from the reverse proxy as an HTML page and never
 * reaches the NestJS filter, so `body` may not be JSON at all.
 */
export function parseApiError(status: number, body: unknown): ApiError {
  const row = asRecord(body);
  return {
    status,
    code: typeof row?.code === 'string' ? row.code : `HTTP_${status}`,
    message: typeof row?.message === 'string' ? row.message : '',
    messageEn: typeof row?.message_en === 'string' ? row.message_en : '',
    params: (asRecord(row?.params) ?? {}) as Record<string, string | number>,
    fields: parseFields(row?.fields)
  };
}

/** A request that never got a response (offline, DNS, CORS, aborted). */
export function networkApiError(): ApiError {
  return {
    status: 0,
    code: 'NETWORK_ERROR',
    message: '',
    messageEn: '',
    params: {},
    fields: []
  };
}

export class ApiResponseError extends Error {
  constructor(readonly error: ApiError) {
    super(error.messageEn || error.message || error.code);
    this.name = 'ApiResponseError';
  }
}

export function isApiResponseError(value: unknown): value is ApiResponseError {
  return value instanceof ApiResponseError;
}

/** Translated label for a DTO field, e.g. `password` -> `رمز عبور`. */
export function resolveFieldLabel(
  field: string,
  language: LanguageCode
): string {
  return (
    lookupWithFallback(language, `apiError.fields.${field}`) ??
    field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function resolveFieldMessage(
  fieldError: FieldError,
  language: LanguageCode = DEFAULT_LANGUAGE
): string {
  const template =
    lookupWithFallback(language, `apiError.${fieldError.code}`) ??
    lookupWithFallback(language, 'apiError.VALIDATION_INVALID') ??
    '';
  return interpolate(
    template,
    {
      ...fieldError.params,
      field: resolveFieldLabel(fieldError.field, language)
    },
    language
  );
}

/**
 * Status-family fallbacks (e.g. 402 → BAD_REQUEST before a dedicated code existed)
 * must not hide the backend's specific localized sentence.
 */
const STATUS_FAMILY_CODES: Readonly<Record<number, string>> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'UNPROCESSABLE',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
  502: 'UPSTREAM_ERROR',
  503: 'SERVICE_UNAVAILABLE',
  504: 'UPSTREAM_TIMEOUT'
};

function isMismatchedFamilyCode(code: string, status: number): boolean {
  const expected = STATUS_FAMILY_CODES[status];
  if (!expected) {
    // Unknown status that was collapsed into a family code (e.g. old 402→BAD_REQUEST).
    return Object.values(STATUS_FAMILY_CODES).includes(code);
  }
  return code !== expected && Object.values(STATUS_FAMILY_CODES).includes(code);
}

/**
 * The one function the UI should call to turn an error into display text.
 *
 * Order: the backend's localized `message` -> our own translation of the code
 * -> the per-status message -> a detailed unknown-error message. The backend
 * owns the wording because it knows exactly what failed; the later steps only
 * cover responses with no usable message. Steps 3 and 4 always exist in `fa`,
 * so the chain can never end in English for a Persian user.
 */
export function resolveApiErrorMessage(
  error: unknown,
  language: LanguageCode = DEFAULT_LANGUAGE
): string {
  const apiError = isApiResponseError(error) ? error.error : null;

  if (apiError) {
    // The backend localizes against the language in the URL prefix. Trust it
    // only when the text really is in this language.
    if (
      apiError.message &&
      (language !== 'fa' || PERSIAN_SCRIPT.test(apiError.message))
    ) {
      return apiError.message;
    }

    const byCode = lookupWithFallback(language, `apiError.${apiError.code}`);
    if (byCode && !isMismatchedFamilyCode(apiError.code, apiError.status)) {
      return interpolate(byCode, apiError.params, language);
    }

    const byStatus = lookupWithFallback(
      language,
      `apiError.HTTP_${apiError.status}`
    );
    if (byStatus) return byStatus;
  }

  return lookupWithFallback(language, 'apiError.UNKNOWN') ?? '';
}
