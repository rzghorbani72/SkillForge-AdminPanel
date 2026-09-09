'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { resetAnonymousAuthClient } from '@/lib/drop-login-session';

/** Wait until leftover session cookies and person/academy data are gone. */
export function AnonymousAuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void resetAnonymousAuthClient().finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  return children;
}
