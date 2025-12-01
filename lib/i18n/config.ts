/**
 * Language and Locale Configuration
 * Maps countries to their default languages and determines text direction (RTL/LTR)
 */

export type LanguageCode =
  | 'en'
  | 'fa'
  | 'ar'
  | 'tr'
  | 'de'
  | 'fr'
  | 'es'
  | 'it'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'hi'
  | 'ur'
  | 'he';

export type TextDirection = 'ltr' | 'rtl';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: TextDirection;
  locale: string; // Full locale code (e.g., 'en-US', 'fa-IR', 'ar-SA')
}

export interface CountryLanguageMapping {
  countryCode: string; // ISO 3166-1 alpha-2
  defaultLanguage: LanguageCode;
  supportedLanguages?: LanguageCode[]; // Optional: languages supported in this country
}

/**
 * Language configurations with RTL/LTR support
 */
export const LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  // LTR Languages
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    locale: 'en-US'
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    direction: 'ltr',
    locale: 'tr-TR'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    locale: 'de-DE'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    locale: 'fr-FR'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    locale: 'es-ES'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    direction: 'ltr',
    locale: 'it-IT'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    locale: 'ru-RU'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    locale: 'zh-CN'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    locale: 'ja-JP'
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    locale: 'ko-KR'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    locale: 'hi-IN'
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl', // Urdu is RTL
    locale: 'ur-PK'
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
    locale: 'he-IL'
  },
  // RTL Languages
  fa: {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    direction: 'rtl',
    locale: 'fa-IR'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    locale: 'ar-SA'
  }
};

/**
 * Country to default language mapping
 * Each country has a default language based on its primary language
 */
export const COUNTRY_LANGUAGE_MAP: Record<string, CountryLanguageMapping> = {
  // Middle East & RTL Countries
  IR: {
    countryCode: 'IR',
    defaultLanguage: 'fa',
    supportedLanguages: ['fa', 'en']
  }, // Iran - Persian
  SA: {
    countryCode: 'SA',
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en']
  }, // Saudi Arabia - Arabic
  AE: {
    countryCode: 'AE',
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en']
  }, // UAE - Arabic
  IQ: {
    countryCode: 'IQ',
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en', 'ku']
  }, // Iraq - Arabic
  SY: {
    countryCode: 'SY',
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en']
  }, // Syria - Arabic
  JO: {
    countryCode: 'JO',
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en']
  }, // Jordan - Arabic
  LB: {
    countryCode: 'LB',
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en', 'fr']
  }, // Lebanon - Arabic
  EG: {
    countryCode: 'EG',
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en']
  }, // Egypt - Arabic
  IL: {
    countryCode: 'IL',
    defaultLanguage: 'he',
    supportedLanguages: ['he', 'en', 'ar']
  }, // Israel - Hebrew
  PK: {
    countryCode: 'PK',
    defaultLanguage: 'ur',
    supportedLanguages: ['ur', 'en']
  }, // Pakistan - Urdu (RTL)

  // LTR Countries
  US: {
    countryCode: 'US',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es']
  }, // USA - English
  GB: { countryCode: 'GB', defaultLanguage: 'en', supportedLanguages: ['en'] }, // UK - English
  CA: {
    countryCode: 'CA',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'fr']
  }, // Canada - English
  AU: { countryCode: 'AU', defaultLanguage: 'en', supportedLanguages: ['en'] }, // Australia - English
  TR: {
    countryCode: 'TR',
    defaultLanguage: 'tr',
    supportedLanguages: ['tr', 'en']
  }, // Turkey - Turkish
  DE: {
    countryCode: 'DE',
    defaultLanguage: 'de',
    supportedLanguages: ['de', 'en']
  }, // Germany - German
  FR: {
    countryCode: 'FR',
    defaultLanguage: 'fr',
    supportedLanguages: ['fr', 'en']
  }, // France - French
  ES: {
    countryCode: 'ES',
    defaultLanguage: 'es',
    supportedLanguages: ['es', 'en']
  }, // Spain - Spanish
  IT: {
    countryCode: 'IT',
    defaultLanguage: 'it',
    supportedLanguages: ['it', 'en']
  }, // Italy - Italian
  RU: {
    countryCode: 'RU',
    defaultLanguage: 'ru',
    supportedLanguages: ['ru', 'en']
  }, // Russia - Russian
  CN: {
    countryCode: 'CN',
    defaultLanguage: 'zh',
    supportedLanguages: ['zh', 'en']
  }, // China - Chinese
  JP: {
    countryCode: 'JP',
    defaultLanguage: 'ja',
    supportedLanguages: ['ja', 'en']
  }, // Japan - Japanese
  KR: {
    countryCode: 'KR',
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en']
  }, // South Korea - Korean
  IN: {
    countryCode: 'IN',
    defaultLanguage: 'hi',
    supportedLanguages: ['hi', 'en']
  } // India - Hindi
};

/**
 * Get default language for a country
 */
export function getDefaultLanguageForCountry(
  countryCode: string
): LanguageCode {
  const mapping = COUNTRY_LANGUAGE_MAP[countryCode.toUpperCase()];
  return mapping?.defaultLanguage || 'en'; // Default to English
}

/**
 * Get language configuration
 */
export function getLanguageConfig(languageCode: string): LanguageConfig {
  const code = languageCode.toLowerCase() as LanguageCode;
  return LANGUAGES[code] || LANGUAGES.en; // Fallback to English
}

/**
 * Check if a language is RTL
 */
export function isRTL(languageCode: string): boolean {
  const config = getLanguageConfig(languageCode);
  return config.direction === 'rtl';
}

/**
 * Get text direction for a language
 */
export function getTextDirection(languageCode: string): TextDirection {
  const config = getLanguageConfig(languageCode);
  return config.direction;
}

/**
 * Get supported languages for a country
 */
export function getSupportedLanguagesForCountry(
  countryCode: string
): LanguageCode[] {
  const mapping = COUNTRY_LANGUAGE_MAP[countryCode.toUpperCase()];
  return mapping?.supportedLanguages || [mapping?.defaultLanguage || 'en'];
}
