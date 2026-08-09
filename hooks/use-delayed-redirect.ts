'use client';

import { useEffect, useState } from 'react';

export type PendingRedirect = {
  href: string;
  title: string;
  message: string;
};

/**
 * Navigates as soon as a redirect is scheduled; `pending` is what the caller
 * renders while the browser is on its way.
 *
 * It used to wait 2.2s on a success screen first, which left a window where a
 * background 401 could redirect to /login and win — a successful login that
 * ended back on the login page.
 */
export function useDelayedRedirect() {
  const [pending, setPending] = useState<PendingRedirect | null>(null);

  useEffect(() => {
    if (!pending) return;
    window.location.href = pending.href;
  }, [pending]);

  return {
    pending,
    scheduleRedirect: setPending,
    clearRedirect: () => setPending(null)
  };
}
