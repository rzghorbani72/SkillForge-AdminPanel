import type { MetadataRoute } from 'next';

/** Private admin surface — block every crawler from the entire panel. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', disallow: '/' },
      { userAgent: 'Googlebot', disallow: '/' },
    ],
  };
}
