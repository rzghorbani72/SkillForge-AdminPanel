'use client';

import { useEffect, useState } from 'react';

/** Debounces raw typing so every keystroke does not hit the API. */
export function useDebouncedValue(value: string, delay = 400): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
