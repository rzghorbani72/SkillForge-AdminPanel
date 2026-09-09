'use client';

import { useEffect } from 'react';
import { wipeNonPlatformStorage } from '@/lib/wipe-non-platform-storage';

/** Auth routes drop academy/person storage; platform language/theme stay. */
export function AuthStorageReset() {
  useEffect(() => {
    wipeNonPlatformStorage();
  }, []);
  return null;
}
