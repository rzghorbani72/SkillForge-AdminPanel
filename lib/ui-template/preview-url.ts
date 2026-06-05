export interface TemplatePreviewSession {
  token: string;
  expiresIn: string;
  academySlug: string;
  previewPath: string;
}

export function buildEmbedPreviewUrl(
  token: string,
  previewPath: string
): string {
  const base = process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/$/, '');
  const query = `preview=${encodeURIComponent(token)}&embed=1`;
  return base ? `${base}${previewPath}?${query}` : `${previewPath}?${query}`;
}

export function buildFullPreviewUrl(embedPreviewUrl: string): string {
  return embedPreviewUrl
    .replace('&embed=1', '')
    .replace('?embed=1&', '?')
    .replace('?embed=1', '');
}

export function appendPreviewCacheBuster(
  url: string,
  refreshKey: number
): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_v=${refreshKey}`;
}
