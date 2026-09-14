import type { Academy } from '@/types/api';
import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';

/**
 * The public address of the academy's own site. A connected custom domain wins;
 * otherwise the academy lives on its slug under the storefront host.
 */
export function buildAcademySiteUrl(academy?: Academy | null): string | undefined {
  if (!academy) return undefined;

  const custom = (academy.domain?.public_address ?? academy.Domain?.public_address ?? '').trim();
  if (custom) {
    return /^https?:\/\//i.test(custom) ? custom : `https://${custom}`;
  }

  const slug = (academy.slug ?? '').trim();
  const base = resolveStorefrontBaseUrl();
  if (!slug || !base) return undefined;
  return `${base}/${slug}`;
}
