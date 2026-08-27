function normalizeOrigin(raw: string): string | null {
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function isTrustedPreviewOrigin(
  origin: string,
  previewBaseUrl: string | null | undefined
): boolean {
  if (!previewBaseUrl) return false;
  const expected = normalizeOrigin(previewBaseUrl);
  return expected !== null && expected === origin;
}

/** Target origin for postMessage into the preview iframe (edusphere). */
export function getPreviewPostMessageTarget(
  previewBaseUrl: string | null | undefined
): string {
  const expected = previewBaseUrl ? normalizeOrigin(previewBaseUrl) : null;
  return expected ?? '*';
}
