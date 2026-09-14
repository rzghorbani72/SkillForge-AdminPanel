import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';

function normalizeOrigin(raw: string): string | null {
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function resolvePreviewOriginBase(
  previewBaseUrl: string | null | undefined,
): string | null | undefined {
  return resolveStorefrontBaseUrl(previewBaseUrl) ?? previewBaseUrl;
}

export function isTrustedPreviewOrigin(
  origin: string,
  previewBaseUrl: string | null | undefined,
): boolean {
  const resolved = resolvePreviewOriginBase(previewBaseUrl);
  if (!resolved) return false;
  const expected = normalizeOrigin(resolved);
  return expected !== null && expected === origin;
}

/** Target origin for postMessage into the preview iframe (edusphere). */
export function getPreviewPostMessageTarget(previewBaseUrl: string | null | undefined): string {
  const resolved = resolvePreviewOriginBase(previewBaseUrl);
  const expected = resolved ? normalizeOrigin(resolved) : null;
  return expected ?? '*';
}
