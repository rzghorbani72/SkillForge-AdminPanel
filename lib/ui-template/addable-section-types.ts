/** Middle-page section types managers can place into an empty slot. */
export const ADDABLE_SECTION_TYPES = [
  'hero',
  'slideshow',
  'videos',
  'features',
  'courses',
  'testimonials',
  'cta',
  'categories',
  'projects',
  'marquee',
  'course-grid',
  'membership',
] as const;

export type AddableSectionType = (typeof ADDABLE_SECTION_TYPES)[number];

export function isAddableSectionType(type: string): type is AddableSectionType {
  return (ADDABLE_SECTION_TYPES as readonly string[]).includes(type);
}
