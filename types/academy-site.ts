/**
 * About/Contact page content and the public contact + social channels shown on
 * the academy's own website. Mirrors `Backend/src/academy-site`.
 */

export const ACADEMY_PAGE_SLUGS = ['about', 'contact'] as const;

export type AcademyPageSlug = (typeof ACADEMY_PAGE_SLUGS)[number];

export const CONTACT_CHANNELS = [
  'phone',
  'email',
  'address',
  'website',
  'instagram',
  'telegram',
  'whatsapp',
  'linkedin',
  'youtube',
  'twitter',
  'aparat',
  'eitaa'
] as const;

export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export type AcademyPage = {
  slug: AcademyPageSlug;
  title: string;
  body: string;
  is_published: boolean;
  updated_at: string | null;
};

export type AcademyPagePayload = {
  title: string;
  body: string;
  is_published: boolean;
};

export type ContactLink = {
  type: ContactChannel;
  value: string;
  label: string | null;
};

export const isContactChannel = (value: string): value is ContactChannel =>
  (CONTACT_CHANNELS as readonly string[]).includes(value);
