'use client';

import { useEffect, useState } from 'react';

export type PendingRedirect = {
  href: string;
  title: string;
  message: string;
};

export function useDelayedRedirect(delayMs = 2200) {
  const [pending, setPending] = useState<PendingRedirect | null>(null);

  useEffect(() => {
    if (!pending) return;

    const timer = window.setTimeout(() => {
      window.location.href = pending.href;
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [pending, delayMs]);

  return {
    pending,
    scheduleRedirect: setPending,
    clearRedirect: () => setPending(null)
  };
}
