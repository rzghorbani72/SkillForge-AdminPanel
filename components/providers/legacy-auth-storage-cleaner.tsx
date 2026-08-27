'use client';

import { useEffect } from 'react';
import { clearLegacyAuthStorage } from '@/lib/clear-legacy-auth-storage';

/** Runs once on load so console edits to old keys cannot spoof RBAC. */
export function LegacyAuthStorageCleaner() {
  useEffect(() => {
    clearLegacyAuthStorage();
  }, []);
  return null;
}
