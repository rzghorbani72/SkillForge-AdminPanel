'use client';

import { ARVAN_DOMAINS_PANEL_URL } from '@/lib/custom-domain-dns';
import { cn } from '@/lib/utils';

const ARVAN_LINK_LABEL = 'panel.arvancloud.ir/cdn/domains';

/**
 * Clickable Arvan domains panel address (opens in a new tab).
 */
export function ArvanDomainsLink({
  className
}: {
  className?: string;
}) {
  return (
    <a
      href={ARVAN_DOMAINS_PANEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      className={cn(
        'font-mono text-primary underline underline-offset-2 hover:text-primary/80',
        className
      )}
    >
      {ARVAN_LINK_LABEL}
    </a>
  );
}
