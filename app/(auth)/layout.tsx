import type { Metadata } from 'next';

import { PANEL_NOINDEX_ROBOTS } from '@/lib/seo/panel-metadata';
import { AuthStorageReset } from '@/components/auth/auth-storage-reset';

/** Auth flows are private — block indexing even if a link leaks. */
export const metadata: Metadata = {
  robots: PANEL_NOINDEX_ROBOTS
};

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthStorageReset />
      {children}
    </>
  );
}
