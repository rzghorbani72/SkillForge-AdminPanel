export interface TemplatePreviewSession {
  token: string;
  expiresIn: string;
  academySlug: string;
  previewPath: string;
}

export function resolveStorefrontBaseUrl(
  storefrontBaseUrl?: string | null
): string | undefined {
  const fromApi = storefrontBaseUrl?.replace(/\/$/, '');
  const fromEnv = process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/$/, '');
  return fromApi || fromEnv || undefined;
}

export function buildEmbedPreviewUrl(
  token: string,
  previewPath: string,
  storefrontBaseUrl?: string | null
): string {
  const base = resolveStorefrontBaseUrl(storefrontBaseUrl);
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
