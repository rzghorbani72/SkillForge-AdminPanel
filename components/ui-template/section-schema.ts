// Declarative description of every section's editable surface, keyed by its
// canonical type. The customization panel derives its Content/Style/Layout tabs
// from this map — no per-type switch statements in the UI. A type absent here
// still renders (header/close + position controls), it just exposes no fields.

export type ContentFieldKind = 'text' | 'textarea' | 'toggle';

export interface ContentFieldSchema {
  key: string;
  // Role-based label (what the field does for a visitor), never the data key.
  label: string;
  kind: ContentFieldKind;
  // Required fields drive amber validation + the incomplete dot in the outline.
  required?: boolean;
  // Secondary fields hidden under the Content tab's "Advanced" expander.
  advanced?: boolean;
  placeholder?: string;
}

export interface SectionSchema {
  // Canonical display name shown everywhere this section appears.
  name: string;
  content: ContentFieldSchema[];
  // Style tab: hero-style background controls (type/color/image/overlay).
  hasBackground?: boolean;
  // Layout tab: text alignment chips.
  hasAlignment?: boolean;
  // Layout tab: section height chips.
  hasHeight?: boolean;
  // Layout tab: grid column chips (2/3/4).
  hasColumns?: boolean;
}

const TITLE: ContentFieldSchema = {
  key: 'title',
  label: 'عنوان بخش',
  kind: 'text',
  required: true,
  placeholder: 'عنوان این بخش'
};

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  header: {
    name: 'ناوبری',
    content: [
      {
        key: 'brandName',
        label: 'نام برند',
        kind: 'text',
        required: true,
        placeholder: 'نام آکادمی'
      }
    ]
  },
  hero: {
    name: 'هیرو',
    content: [
      {
        key: 'title',
        label: 'عنوان اصلی',
        kind: 'text',
        required: true,
        placeholder: 'پیام اصلی صفحه'
      },
      {
        key: 'subtitle',
        label: 'متن پشتیبان',
        kind: 'textarea',
        placeholder: 'توضیح کوتاه زیر عنوان'
      },
      {
        key: 'ctaText',
        label: 'متن دکمه اصلی',
        kind: 'text',
        placeholder: 'مثلاً: شروع کنید'
      },
      {
        key: 'ctaSecondary',
        label: 'متن دکمه دوم',
        kind: 'text',
        advanced: true,
        placeholder: 'مثلاً: بیشتر بدانید'
      },
      { key: 'showCTA', label: 'نمایش دکمه', kind: 'toggle', advanced: true }
    ],
    hasBackground: true,
    hasAlignment: true,
    hasHeight: true
  },
  features: {
    name: 'ویژگی‌ها',
    content: [{ ...TITLE }],
    hasColumns: true
  },
  courses: {
    name: 'دوره‌ها',
    content: [{ ...TITLE }],
    hasColumns: true
  },
  testimonials: {
    name: 'نظرات',
    content: [{ ...TITLE }]
  },
  pricing: {
    name: 'تعرفه‌ها',
    content: [{ ...TITLE }]
  },
  cta: {
    name: 'فراخوان',
    content: [
      {
        key: 'title',
        label: 'عنوان اصلی',
        kind: 'text',
        required: true,
        placeholder: 'دعوت به اقدام'
      },
      { key: 'subtitle', label: 'متن پشتیبان', kind: 'textarea' },
      { key: 'ctaText', label: 'متن دکمه', kind: 'text' }
    ]
  },
  categories: {
    name: 'دسته‌بندی‌ها',
    content: [{ ...TITLE }],
    hasColumns: true
  },
  projects: {
    name: 'نمونه‌کارها',
    content: [{ ...TITLE }],
    hasColumns: true
  },
  'course-grid': {
    name: 'شبکه دوره‌ها',
    content: [{ ...TITLE }],
    hasColumns: true
  },
  footer: { name: 'فوتر', content: [] },
  slideshow: { name: 'اسلایدشو', content: [] }
};

export function getSectionSchema(type: string): SectionSchema {
  return SECTION_SCHEMAS[type] ?? { name: type, content: [] };
}

// A section is incomplete when any required content field is empty — surfaced as
// an amber warning in the panel and an amber dot wherever the section is listed.
export function isSectionIncomplete(
  type: string,
  config: Record<string, unknown> | undefined
): boolean {
  const schema = getSectionSchema(type);
  return schema.content.some(
    (field) => field.required && !String((config ?? {})[field.key] ?? '').trim()
  );
}
