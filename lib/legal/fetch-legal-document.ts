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
        { cache: 'no-store' }
      );
      if (res.ok) {
        const payload = (await res.json()) as LegalDocument;
        if (payload.body && payload.title) {
          return payload;
        }
      }
    } catch {
      // try next locale
    }
  }

  return null;
}
