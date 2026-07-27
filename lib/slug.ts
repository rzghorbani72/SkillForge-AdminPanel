export type SlugStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'invalid';

const MAX_SLUG_LENGTH = 40;

export const ACADEMY_DOMAIN =
  process.env.NEXT_PUBLIC_ACADEMY_DOMAIN ?? 'mentoma.ir';

export const RESERVED_SLUGS = new Set([
  'api',
  'www',
  'admin',
  'app',
  'mail',
  'email',
  'ftp',
  'smtp',
  'pop',
  'imap',
  'blog',
  'shop',
  'store',
  'support',
  'help',
  'docs',
  'status',
  'cdn',
  'static',
  'assets',
  'media',
  'img',
  'images',
  'auth',
  'login',
  'logout',
  'signup',
  'register',
  'dashboard',
  'panel',
  'console',
  'portal',
  'dev',
  'staging',
  'test',
  'demo',
  'beta',
  'internal',
  'platform',
  'mentoma',
  'edusphere'
]);

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, MAX_SLUG_LENGTH);
}

export function isValidSlug(slug: string): boolean {
  return new RegExp(
    `^[a-z0-9](?:[a-z0-9-]{0,${MAX_SLUG_LENGTH - 2}}[a-z0-9])?$`
  ).test(slug);
}
