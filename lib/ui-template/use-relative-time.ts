'use client';

import { useEffect, useState } from 'react';

// Re-renders every 10s so a "saved N ago" label stays fresh without a prop.
export function useRelativeTime(since: number | null): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (since == null) return;
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, [since]);

  if (since == null) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - since) / 1000));
  if (seconds < 5) return 'هم‌اکنون';
  if (seconds < 60) return `${seconds} ثانیه پیش`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  return `${hours} ساعت پیش`;
}
