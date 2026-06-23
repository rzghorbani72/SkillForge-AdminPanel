export type BorderRadius = 'sharp' | 'soft' | 'rounded';
export type Shadow = 'none' | 'subtle' | 'medium' | 'strong';
export type SectionSpacing = 'compact' | 'comfortable' | 'spacious';
export type ContainerWidth = 'narrow' | 'standard' | 'wide' | 'full';
export type HeadingScale = 'compact' | 'standard' | 'large';
export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

export const FONT_FAMILIES = [
  'IRANYekan',
  'Vazir',
  'Shabnam',
  'Estedad'
] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

/**
 * Save action surfaced in the sidebar footer:
 * - 'copy'          : Manager on a public preset — forks a dedicated copy
 * - 'override'      : Manager on their own dedicated template — saves in place
 * - 'both'          : Admin editing the master public template
 * - 'admin-override': Admin on a dedicated template — save & publish base
 */
export type SaveMode = 'copy' | 'override' | 'both' | 'admin-override';
