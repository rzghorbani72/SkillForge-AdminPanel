/**
 * Images come back as a path relative to the API host; the browser needs an
 * absolute URL to render them. Already-absolute URLs pass through untouched.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${url}` : url;
}

/**
 * A resized copy of an uploaded image (`/images/get-image?id=`). The API snaps
 * the width to a cached ladder; other URLs pass through unchanged.
 */
export function resizedMediaUrl(url: string, width: number): string {
  if (!url.includes('/images/get-image')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}`;
}
