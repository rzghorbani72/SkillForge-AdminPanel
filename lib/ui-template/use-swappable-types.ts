'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface CatalogEntry {
  blockType: string;
}

// A section type is "swappable" only when the catalog holds 2+ design variants
// of it — otherwise "change design" would show nothing. Mirrors Wix, which only
// offers a design swap where alternative designs exist.
//
// Returns null while loading so callers don't briefly hide a valid swap button;
// once loaded, only types with alternatives remain.
export function useSwappableSectionTypes(enabled: boolean): Set<string> | null {
  const [types, setTypes] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    apiClient
      .getSectionCatalog()
      .then((data) => {
        if (cancelled) return;
        const counts = new Map<string, number>();
        for (const entry of data as CatalogEntry[]) {
          counts.set(entry.blockType, (counts.get(entry.blockType) ?? 0) + 1);
        }
        const swappable = new Set<string>();
        Array.from(counts.entries()).forEach(([type, n]) => {
          if (n >= 2) swappable.add(type);
        });
        setTypes(swappable);
      })
      .catch(() => {
        if (!cancelled) setTypes(new Set());
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return types;
}
