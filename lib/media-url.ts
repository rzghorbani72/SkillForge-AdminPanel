/**
 * Images come back as a path relative to the API host; the browser needs an
 * absolute URL to render them. Already-absolute URLs pass through untouched.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${url}`
    : url;
}
