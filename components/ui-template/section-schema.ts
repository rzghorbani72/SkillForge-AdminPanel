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
  // Pre-fills the input when block.config has no value for this key yet —
  // shown so the manager sees what the preview is displaying, not an empty box.
  defaultValue?: string;
  // Field whose empty-state default comes from live academy data instead of a
  // constant. Without this the panel would show a generic placeholder while the
  // preview renders the real value, and saving would overwrite the real one.
  defaultFrom?: 'academyName';
  // For toggle fields: the value when unset (defaults to true when omitted).
  defaultOn?: boolean;
  // Optional one-line explanation shown under the field.
  hint?: string;
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
  // Layout tab: grid column chips (2/3/4). Only set this where the renderer
  // actually reads config.gridColumns — features and courses do. The mosaic
  // (projects), the pill row (categories) and the multi-variant course-grid
  // have fixed layouts, so chips there would move nothing.
  hasColumns?: boolean;
  // Shown in the Content tab to explain which parts come from live academy data
  // (not editable here) vs static text (editable in the fields above).
  dynamicContentNote?: string;
}

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  header: {
    name: 'ناوبری',
    content: [
      {
        key: 'brandName',
        label: 'نام برند / آکادمی',
        kind: 'text',
        required: true,
        placeholder: 'نام آکادمی خود را وارد کنید',
        // Mirrors the renderer, which falls back to the academy's own name.
        defaultFrom: 'academyName',
        defaultValue: 'آکادمی من'
      },
      {
        key: 'loginText',
        label: 'متن دکمه ورود',
        kind: 'text',
        placeholder: 'مثلاً: ورود',
        defaultValue: 'ورود',
        hint: 'دکمه ورود همیشه در سمت چپ نوار می‌ماند و حذف یا جابه‌جا نمی‌شود'
      }
    ]
  },

  hero: {
    name: 'بخش بنر اصلی',
    content: [
      {
        key: 'title',
        label: 'عنوان اصلی',
        kind: 'text',
        required: true,
        placeholder: 'پیام اصلی صفحه',
        defaultValue: 'به آکادمی ما خوش آمدید'
      },
      {
        key: 'subtitle',
        label: 'متن پشتیبان',
        kind: 'textarea',
        placeholder: 'توضیح کوتاه زیر عنوان',
        defaultValue: 'بهترین دوره‌های آموزشی را اینجا بیابید'
      },
      {
        key: 'ctaText',
        label: 'متن دکمه اصلی',
        kind: 'text',
        placeholder: 'مثلاً: شروع کنید',
        defaultValue: 'شروع کنید'
      },
      {
        key: 'ctaSecondary',
        label: 'متن دکمه دوم',
        kind: 'text',
        advanced: true,
        placeholder: 'مثلاً: بیشتر بدانید'
      },
      // Extra fields used by flow / code / creative hero styles.
      // Hidden under "Advanced" so the default hero keeps a clean panel.
      {
        key: 'tag',
        label: 'برچسب بالای عنوان',
        kind: 'text',
        advanced: true,
        placeholder: 'مثلاً: جدید — ویژگی تازه'
      },
      {
        key: 'titleEm',
        label: 'کلمه کلیدی برجسته (میانه عنوان)',
        kind: 'text',
        advanced: true,
        placeholder: 'بخش رنگی وسط عنوان'
      },
      {
        key: 'titleEnd',
        label: 'ادامه عنوان (بعد از کلمه برجسته)',
        kind: 'text',
        advanced: true,
        placeholder: 'پایان جمله عنوان'
      },
      {
        key: 'trustCount',
        label: 'تعداد یادگیرندگان',
        kind: 'text',
        advanced: true,
        placeholder: 'مثلاً: ۱۲٬۰۰۰+',
        hint: 'اگر «نمایش آمار واقعی» فعال باشد این مقدار از API جایگزین می‌شود'
      },
      {
        key: 'useLiveData',
        label: 'نمایش آمار واقعی آکادمی',
        kind: 'toggle',
        defaultOn: false,
        hint: 'تعداد واقعی دوره‌ها و دانشجویان به‌جای اعداد نمونه نمایش داده می‌شود'
      },
      { key: 'showCTA', label: 'نمایش دکمه', kind: 'toggle', advanced: true }
    ],
    hasBackground: true,
    hasAlignment: true,
    hasHeight: true
  },

  features: {
    name: 'ویژگی‌ها',
    content: [
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'ویژگی‌های کلیدی ما'
      },
      {
        key: 'subtitle',
        label: 'توضیحات زیر عنوان',
        kind: 'textarea',
        placeholder: 'چرا ما را انتخاب کنید',
        defaultValue: 'آنچه یادگیری در آکادمی ما را خاص می‌کند'
      }
    ],
    hasColumns: true,
    dynamicContentNote:
      'کارت‌های ویژگی از محتوای پیش‌فرض قالب نمایش داده می‌شوند. برای تغییر طرح‌بندی یا نوع کارت‌ها، می‌توانید این بخش را با یک سبک جدید جایگزین کنید.'
  },

  courses: {
    name: 'دوره‌ها',
    content: [
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'دوره‌های آموزشی'
      }
    ],
    hasColumns: true,
    dynamicContentNote:
      'کارت‌های دوره به‌صورت زنده از دوره‌های واقعی آکادمی شما بارگذاری می‌شوند. مدیریت دوره‌ها از بخش «دوره‌ها» در داشبورد انجام می‌شود.'
  },

  testimonials: {
    name: 'نظرات',
    content: [
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'نظرات دانشجویان ما'
      }
    ],
    dynamicContentNote:
      'نظرات به‌صورت زنده از بازخوردهای ثبت‌شده دانشجویان آکادمی شما نمایش داده می‌شوند.'
  },

  cta: {
    name: 'فراخوان به عمل',
    content: [
      {
        key: 'title',
        label: 'عنوان اصلی',
        kind: 'text',
        required: true,
        placeholder: 'دعوت به اقدام',
        defaultValue: 'همین حالا شروع کنید'
      },
      {
        key: 'subtitle',
        label: 'متن پشتیبان',
        kind: 'textarea',
        placeholder: 'توضیح تکمیلی',
        defaultValue: 'به جمع یادگیرندگان ما بپیوندید'
      },
      {
        key: 'ctaText',
        label: 'متن دکمه',
        kind: 'text',
        placeholder: 'مثلاً: ثبت‌نام کنید',
        defaultValue: 'ثبت‌نام کنید'
      }
    ]
  },

  categories: {
    name: 'دسته‌بندی‌ها',
    content: [
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'دسته‌بندی‌های آموزشی'
      }
    ],
    dynamicContentNote:
      'دسته‌بندی‌ها به‌صورت زنده از دسته‌بندی‌های دوره‌های آکادمی شما بارگذاری می‌شوند.'
  },

  projects: {
    name: 'نمونه‌کارها',
    content: [
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'نمونه‌کارهای برگزیده'
      }
    ]
  },

  'course-grid': {
    name: 'شبکه دوره‌ها',
    content: [
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'همه دوره‌ها'
      }
    ],
    dynamicContentNote:
      'دوره‌ها به‌صورت زنده از کاتالوگ دوره‌های آکادمی شما نمایش داده می‌شوند.'
  },

  teachers: {
    name: 'مدرسان',
    content: [
      {
        key: 'eyebrow',
        label: 'برچسب بالای عنوان',
        kind: 'text',
        advanced: true,
        placeholder: 'مثلاً: تیم مدرسان'
      },
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'مدرسان ما'
      },
      {
        key: 'subtitle',
        label: 'توضیحات زیر عنوان',
        kind: 'textarea',
        placeholder: 'یک جمله دربارهٔ تیم مدرسان'
      }
    ],
    dynamicContentNote:
      'کارت مدرسان از محتوای پیش‌فرض قالب نمایش داده می‌شود. تا زمانی که عکسی بارگذاری نشود، حرف اول نام مدرس نمایش داده می‌شود.'
  },

  showcase: {
    name: 'بخش ویژهٔ قالب',
    content: [
      {
        key: 'eyebrow',
        label: 'برچسب بالای عنوان',
        kind: 'text',
        advanced: true,
        placeholder: 'مثلاً: تقویم برنامه‌ها'
      },
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'برنامهٔ پیش‌رو'
      },
      {
        key: 'subtitle',
        label: 'توضیحات زیر عنوان',
        kind: 'textarea',
        placeholder: 'توضیح کوتاه دربارهٔ این بخش'
      }
    ],
    dynamicContentNote:
      'هر قالب یک بخش ویژه دارد: جدول تقویم، مسیر سطح‌بندی، نردبان پیشرفت یا نمونه‌سؤال. ساختار آن با قالب تعیین می‌شود و متن‌های بالا قابل ویرایش‌اند.'
  },

  footer: { name: 'فوتر', content: [] },
  slideshow: {
    name: 'اسلایدشو / بنر',
    content: [],
    hasAlignment: true,
    hasHeight: true,
    dynamicContentNote:
      'تصویر، عنوان و متن هر اسلاید را در همین پنل، بخش «اسلایدها» تنظیم کنید. تا زمانی که اسلایدی اضافه نشود این بخش در سایت نمایش داده نمی‌شود.'
  },

  videos: {
    name: 'ویدیوها',
    content: [
      {
        key: 'title',
        label: 'عنوان بخش',
        kind: 'text',
        required: true,
        placeholder: 'عنوان این بخش',
        defaultValue: 'ویدیوهای آکادمی'
      },
      {
        key: 'subtitle',
        label: 'توضیحات زیر عنوان',
        kind: 'textarea',
        placeholder: 'یک جمله دربارهٔ ویدیوها',
        defaultValue:
          'معرفی کوتاه دوره‌ها، کلاس‌ها و فضای آموزشی ما را تماشا کنید.'
      }
    ],
    dynamicContentNote:
      'ویدیوها از کتابخانه رسانه آکادمی انتخاب می‌شوند و تا زمان کلیک بازدیدکننده پخش نمی‌شوند. تا زمانی که ویدیویی انتخاب نشود این بخش در سایت نمایش داده نمی‌شود.'
  },
  marquee: { name: 'عناوین متحرک', content: [] },
  membership: { name: 'اشتراک', content: [] },
  placeholder: { name: 'جایگاه خالی', content: [] }
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
    (field) =>
      field.required &&
      !String((config ?? {})[field.key] ?? field.defaultValue ?? '').trim()
  );
}
