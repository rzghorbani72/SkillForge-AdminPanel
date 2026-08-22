import type { ReactNode } from 'react';

import { WebsiteTabs } from '@/components/website/website-tabs';

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <WebsiteTabs />
      <div className="flex-1">{children}</div>
    </div>
  );
}
