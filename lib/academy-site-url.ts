import { resolveStorefrontBaseUrl } from './ui-template/preview-url';

interface DomainAddress {
  private_address?: string | null;
  public_address?: string | null;
}

export interface AcademyAddress {
  slug?: string | null;
  /** Some endpoints inline the subdomain instead of nesting it under domain. */
  private_address?: string | null;
  domain?: DomainAddress | null;
  /** Prisma relation casing, returned by a few endpoints. */
  Domain?: DomainAddress | null;
}

const clean = (value?: string | null): string | undefined =>
  value?.trim() || undefined;

/**
 * Where an academy's public site lives. A custom hostname the academy owns wins;
 * otherwise the academy is served from its own subdomain of the storefront.
 * Mirrors academySiteUrl() in Backend/src/common/storefront-url.ts — keep the
 * two in step so a link in the panel always matches what the backend sends out.
 */
export function academySiteUrl(
  academy: AcademyAddress | null | undefined
): string | null {
  if (!academy) return null;

  const domain = academy.domain ?? academy.Domain ?? null;
  const publicAddress = clean(domain?.public_address);
  if (publicAddress) return `https://${publicAddress}`;

  const subdomain =
    clean(domain?.private_address) ??
    clean(academy.private_address) ??
    clean(academy.slug);
  if (!subdomain) return null;

  const base = resolveStorefrontBaseUrl();
  if (!base) return null;

  try {
    const { protocol, host } = new URL(base);
    return `${protocol}//${subdomain}.${host.replace(/^www\./, '')}`;
  } catch {
    return null;
  }
}
