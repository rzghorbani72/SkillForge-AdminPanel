'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/** Selected id that starts from `?<param>=` and follows it when a link changes it. */
export function useUrlSelection(param: string) {
  const fromUrl = useSearchParams().get(param);
  const [selected, setSelected] = useState<string | null>(fromUrl);
  const [lastUrlValue, setLastUrlValue] = useState(fromUrl);
  if (fromUrl !== lastUrlValue) {
    setLastUrlValue(fromUrl);
    if (fromUrl) setSelected(fromUrl);
  }
  return [selected, setSelected] as const;
}
