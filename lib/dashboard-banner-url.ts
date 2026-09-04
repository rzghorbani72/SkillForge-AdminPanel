import { getBrowserApiBaseUrl } from '@/lib/api-base-url';

export function dashboardBannerSrc(imageId: string): string {
  return `${getBrowserApiBaseUrl()}/images/fetch-image-by-id/${imageId}`;
}

export function uploadedImageId(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null;
  const raw = result as Record<string, unknown>;
  const nested = raw.data;
  const data =
    nested && typeof nested === 'object'
      ? (nested as Record<string, unknown>)
      : raw;
  const id = data.id;
  return id === undefined || id === null ? null : String(id);
}
