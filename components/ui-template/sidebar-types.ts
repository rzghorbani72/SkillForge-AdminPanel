export type BorderRadius = 'sharp' | 'soft' | 'rounded';
export type Shadow = 'none' | 'subtle' | 'medium' | 'strong';
export type SectionSpacing = 'compact' | 'comfortable' | 'spacious';
export type ContainerWidth = 'narrow' | 'standard' | 'wide' | 'full';
export type HeadingScale = 'compact' | 'standard' | 'large';
export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

// Slugs mirror Backend FONT_FAMILY_SLUGS + edusphere font stacks. The public
// site only loads these families, so the picker can never offer a font that
// fails to render. `preview` is the CSS stack used for the in-picker label.
export const FONT_OPTIONS = [
  {
    slug: 'vazirmatn',
    label: 'وزیرمتن (مدرن)',
    preview: "'Vazirmatn', sans-serif"
  },
  { slug: 'markazi', label: 'مرکزی (سریف)', preview: "'Markazi Text', serif" },
  {
    slug: 'noto-naskh',
    label: 'نسخ (سنتی)',
    preview: "'Noto Naskh Arabic', serif"
  },
  { slug: 'lalezar', label: 'لاله‌زار (تیتر)', preview: "'Lalezar', cursive" }
] as const;
export type FontFamily = (typeof FONT_OPTIONS)[number]['slug'];

/**
 * Save action surfaced in the sidebar footer:
 * - 'copy'          : Manager on a public preset — forks a dedicated copy
 * - 'override'      : Manager on their own dedicated template — saves in place
 * - 'both'          : Admin editing the master public template
 * - 'admin-override': Admin on a dedicated template — save & publish base
 */
export type SaveMode = 'copy' | 'override' | 'both' | 'admin-override';
