import { useEffect, useState } from 'react';

export function useShowOnce(storageKey: string, active: boolean): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    try {
      if (localStorage.getItem(storageKey)) return;
      localStorage.setItem(storageKey, '1');
      setVisible(true);
    } catch {
      setVisible(false);
    }
  }, [storageKey, active]);

  return visible;
}
