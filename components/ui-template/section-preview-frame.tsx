'use client';

import { ScaledIframe } from '@/components/shared/scaled-iframe';

interface SectionPreviewFrameProps {
  // Storefront origin that serves /preview/blocks (from the preview session).
  baseUrl: string;
  templateKey: string;
  // When set, renders only this block; otherwise the whole template.
  blockId?: string;
  // Preview token carrying academy scope (lets dedicated templates resolve).
  token?: string;
  virtualWidth?: number;
  interactive?: boolean;
  // Extra query params forwarded to /preview/blocks (e.g. heroStyle override).
  params?: Record<string, string>;
  onLoad?: () => void;
  // Skip when the caller already draws its own placeholder (the gallery card does).
  showLoading?: boolean;
  className?: string;
}

// Real storefront render of a template/section, scaled to fit its container.
export function SectionPreviewFrame({
  baseUrl,
  templateKey,
  blockId,
  token,
  params,
  ...frameProps
}: SectionPreviewFrameProps) {
  // embed=1 makes the storefront proxy allow AdminPanel as a frame ancestor;
  // sample=1 swaps the visitor's academy brand for the neutral sample brand.
  const queryParams = new URLSearchParams({
    template: templateKey,
    embed: '1',
    sample: '1',
  });
  if (blockId) queryParams.set('only', blockId);
  if (token) queryParams.set('token', token);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      queryParams.set(key, value);
    }
  }
  const src = `${baseUrl.replace(/\/$/, '')}/preview/blocks?${queryParams.toString()}`;

  return <ScaledIframe src={src} title="Section preview" {...frameProps} />;
}
