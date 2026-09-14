import { API_DEVELOPMENT_DEFAULTS, API_PRODUCTION_DEFAULTS } from '../api-config';

export interface TemplatePreviewSession {
  token: string;
  expiresIn: string;
  academySlug: string;
  previewPath: string;
}

/**
 * Gallery thumbnails render before any preview token exists, so there is no
 * backend-supplied URL to fall back on. Without a production default the cards
 * silently degrade to plain gradients whenever the build env is missing.
 */
export function resolveStorefrontBaseUrl(storefrontBaseUrl?: string | null): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === 'development') {
    return API_DEVELOPMENT_DEFAULTS.storefrontUrl;
  }

  return storefrontBaseUrl?.replace(/\/$/, '') || API_PRODUCTION_DEFAULTS.storefrontUrl;
}

export function buildEmbedPreviewUrl(
  token: string,
  previewPath: string,
  storefrontBaseUrl?: string | null,
  options?: { sample?: boolean },
): string {
  const base = resolveStorefrontBaseUrl(storefrontBaseUrl);
  let query = `preview=${encodeURIComponent(token)}&embed=1`;
  if (options?.sample) query += '&sample=1';
  return base ? `${base}${previewPath}?${query}` : `${previewPath}?${query}`;
}

export function buildFullPreviewUrl(embedPreviewUrl: string): string {
  return embedPreviewUrl.replace('&embed=1', '').replace('?embed=1&', '?').replace('?embed=1', '');
}

export function buildTemplatePreviewUrl(
  templateId: string,
  storefrontBaseUrl?: string | null,
  options?: {
    sample?: boolean;
    draft?: boolean;
    edit?: boolean;
    token?: string;
    realData?: boolean;
  },
): string {
  const base = resolveStorefrontBaseUrl(storefrontBaseUrl);
  let query = `template=${encodeURIComponent(templateId)}&embed=1`;
  if (options?.sample) query += '&sample=1';
  // Real-data mode renders dynamic blocks with the academy's own records.
  if (options?.realData) query += '&data=real';
  // Draft mode renders the academy's own work-in-progress blocks (e.g. a freshly
  // generated, personalized site). It needs a preview token to scope the academy.
  if (options?.draft && options.token) {
    query += `&draft=1&token=${encodeURIComponent(options.token)}`;
  }
  // Edit mode turns on in-canvas section selection (click a section to edit it).
  if (options?.edit) query += '&edit=1';
  return base ? `${base}/preview/blocks?${query}` : `/preview/blocks?${query}`;
}

export function appendPreviewCacheBuster(url: string, refreshKey: number): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_v=${refreshKey}`;
}
