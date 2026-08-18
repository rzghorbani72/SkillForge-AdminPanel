/**
 * Single source of truth for the gallery templates' manager-facing identity.
 *
 * The template KEY is an internal slug and never shown; the NAME and VERTICAL
 * below are what a manager reads in the gallery, the hero picker and the
 * customization sidebar. Keeping them here means renaming a template is a
 * one-line change instead of a hunt across components.
 *
 * The gallery grid itself shows `Template.name` returned by the API (seeded
 * from `Backend/src/ui-template/templates/template-presets.ts`) — keep the two
 * in sync when renaming, since the DB copy is what a saved academy sees.
 */

export const TEMPLATE_KEYS = [
  'keyhan',
  'tavan',
  'dastan',
  'parastoo',
  'nokhbeh',
  'zabaneh',
  'bikaran',
  'raushan',
  'shabtab',
  'sepid',
  'hamrang',
  'baran',
  'shafagh',
  'elektron'
] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export interface TemplateIdentity {
  /** Manager-facing name. */
  name: string;
  /** Which kind of academy the design is built for. */
  vertical: string;
  /** Three role words shown as tags on the gallery card. */
  tagline: string;
}

export const TEMPLATE_IDENTITY: Record<TemplateKey, TemplateIdentity> = {
  keyhan: {
    name: 'کیهان',
    vertical: 'علمی و فنی',
    tagline: 'علمی · رصدی · تیره'
  },
  tavan: {
    name: 'توان',
    vertical: 'ورزشی و مهارتی',
    tagline: 'پرانرژی · مهارتی · داده‌محور'
  },
  dastan: {
    name: 'دستان',
    vertical: 'کارگاهی و هنری',
    tagline: 'گرم · کارگاهی · کلاسیک'
  },
  parastoo: {
    name: 'پرستو',
    vertical: 'کودک و نوجوان',
    tagline: 'شاد · کودک‌پسند · رنگی'
  },
  nokhbeh: {
    name: 'نخبه',
    vertical: 'درسی و کنکور',
    tagline: 'درسی · کنکور · دقیق'
  },
  zabaneh: {
    name: 'زبانه',
    vertical: 'آموزش زبان',
    tagline: 'زبان · گفت‌وگومحور · روشن'
  },
  bikaran: {
    name: 'بی‌کران',
    vertical: 'نجوم و علوم',
    tagline: 'نجوم · اطلس‌گونه · کاغذی'
  },
  raushan: {
    name: 'روشن',
    vertical: 'عمومی و چندمنظوره',
    tagline: 'روشن · مینیمال · حرفه‌ای'
  },
  shabtab: {
    name: 'شب‌تاب',
    vertical: 'عمومی و چندمنظوره',
    tagline: 'تیره · درخشان · مدرن'
  },
  sepid: {
    name: 'سپید',
    vertical: 'عمومی و چندمنظوره',
    tagline: 'ساده · متمرکز · بی‌آلایش'
  },
  hamrang: {
    name: 'هم‌رنگ',
    vertical: 'عمومی و چندمنظوره',
    tagline: 'رنگی · پرانرژی · شاد'
  },
  baran: {
    name: 'باران',
    vertical: 'عمومی و چندمنظوره',
    tagline: 'ملایم · آرام · مینیمال'
  },
  shafagh: {
    name: 'شفق',
    vertical: 'عکاسی و رسانهٔ بصری',
    tagline: 'رنگی · گرم · گالری‌گونه'
  },
  elektron: {
    name: 'الکترون',
    vertical: 'دیجیتال، رسانه و طراحی',
    tagline: 'رنگی · مدرن · پرانرژی'
  }
};

const FALLBACK_IDENTITY: TemplateIdentity = {
  name: 'قالب اختصاصی',
  vertical: 'عمومی',
  tagline: 'ساده · تمیز · قابل تنظیم'
};

export function getTemplateIdentity(key: string): TemplateIdentity {
  return TEMPLATE_IDENTITY[key as TemplateKey] ?? FALLBACK_IDENTITY;
}

/** `name — vertical`, used wherever a picker needs one self-explaining line. */
export function getTemplateLabel(key: string): string {
  const identity = getTemplateIdentity(key);
  return `${identity.name} — ${identity.vertical}`;
}
