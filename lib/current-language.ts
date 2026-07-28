import { DEFAULT_LANGUAGE, type LanguageCode } from './i18n/config';
import { API_LANGS } from './api-lang';

/**
 * The language the user picked, which is also the one the API was called with
 * (see `langApiVersionPath`). Single source of truth — this used to be copy
 * pasted with its own hardcoded language list at several call sites.
 */
export function currentLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = localStorage.getItem('preferred_language');
  if (stored && (API_LANGS as readonly string[]).includes(stored)) {
    return stored as LanguageCode;
  }
  return DEFAULT_LANGUAGE;
}
