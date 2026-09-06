export type TextDirection = 'ltr' | 'rtl';
export type BorderRadius = 'sharp' | 'soft' | 'rounded';
export type Shadow = 'none' | 'subtle' | 'medium' | 'strong';
export type ElementAnimation = 'none' | 'subtle' | 'moderate' | 'dynamic';
export type SectionSpacing = 'compact' | 'comfortable' | 'spacious';
export type ContainerWidth = 'narrow' | 'standard' | 'wide' | 'full';
export type HeadingScale = 'compact' | 'standard' | 'large';
export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

// Slugs mirror Backend FONT_FAMILY_SLUGS + edusphere font stacks. The public
// site only loads these families, so the picker can never offer a font that
// fails to render. `preview` is the CSS stack used for the in-picker label.
// `script` groups fonts in the picker: 'arabic' = Persian/Arabic, 'latin' = English/Latin.
export const FONT_OPTIONS = [
  // Persian / Arabic
  {
    slug: 'vazirmatn',
    label: 'وزیرمتن',
    script: 'arabic' as const,
    preview: "'Vazirmatn', sans-serif"
  },
  {
    slug: 'markazi',
    label: 'مرکزی',
    script: 'arabic' as const,
    preview: "'Markazi Text', serif"
  },
  {
    slug: 'noto-naskh',
    label: 'نسخ',
    script: 'arabic' as const,
    preview: "'Noto Naskh Arabic', serif"
  },
  {
    slug: 'lalezar',
    label: 'لاله‌زار',
    script: 'arabic' as const,
    preview: "'Lalezar', cursive"
  },
  // Latin / English
  {
    slug: 'inter',
    label: 'Inter',
    script: 'latin' as const,
    preview: "'Inter', sans-serif"
  },
  {
    slug: 'poppins',
    label: 'Poppins',
    script: 'latin' as const,
    preview: "'Poppins', sans-serif"
  },
  {
    slug: 'playfair',
    label: 'Playfair',
    script: 'latin' as const,
    preview: "'Playfair Display', serif"
  }
] as const;
export type FontFamily = (typeof FONT_OPTIONS)[number]['slug'];

/**
 * Save action surfaced in the sidebar footer:
 * - 'copy'          : Manager on a public preset — forks a dedicated copy
 * - 'override'      : Manager on their own dedicated template — saves in place
 * - 'both'          : Admin editing the master public template
 * - 'admin-override': Admin on a dedicated template — save & publish base
 */
// 'copy' = the manager's own version; 'admin-override' = platform staff editing
// the public original in place.
export type SaveMode = 'copy' | 'admin-override';
