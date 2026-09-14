/**
 * API path languages for /:lang/v1/...
 * Keep aligned with Backend/src/common/api-lang.ts when adding languages.
 */
export const API_LANGS = [
  'fa',
  'en',
  'ar',
  'tr',
  'de',
  'fr',
  'es',
  'et',
  'it',
  'ru',
  'zh',
  'ja',
  'ko',
  'hi',
  'ur',
  'he',
] as const;

export type ApiLang = (typeof API_LANGS)[number];

export const DEFAULT_API_LANG: ApiLang = 'fa';

const API_LANG_SET = new Set<string>(API_LANGS);

export function isApiLang(value: string): value is ApiLang {
  return API_LANG_SET.has(value.toLowerCase());
}

export function normalizeApiLang(value?: string | null): ApiLang {
  if (!value) return DEFAULT_API_LANG;
  const lower = value.toLowerCase();
  return isApiLang(lower) ? lower : DEFAULT_API_LANG;
}

/** Same-origin browser API prefix, e.g. /fa/v1 */
export function langApiVersionPath(lang?: string | null): string {
  return `/${normalizeApiLang(lang)}/v1`;
}
