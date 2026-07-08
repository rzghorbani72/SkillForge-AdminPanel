import 'server-only';

import { getServerApiBaseUrl } from '@/lib/api-base-url';
import type { LegalDocType, LegalDocument } from './types';

const FALLBACK_LOCALES = ['fa', 'en'] as const;

export async function fetchLegalDocument(
  type: LegalDocType,
  locale: string
): Promise<LegalDocument | null> {
  const candidates = [
    locale,
    ...FALLBACK_LOCALES.filter((candidate) => candidate !== locale)
  ];
  const base = getServerApiBaseUrl();

  for (const loc of candidates) {
    try {
      const res = await fetch(
        `${base}/legal/documents/${type}?locale=${encodeURIComponent(loc)}`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        return (await res.json()) as LegalDocument;
      }
    } catch {
      // try next locale
    }
  }

  return null;
}
