'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BadgeCheck, FileText, Globe, Layout, Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

/**
 * Real links, not a JS tab widget: every tab is a URL the manager can share,
 * bookmark or open in a new tab.
 */
export function WebsiteTabs() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const tabs = [
    { href: '/website', label: t('website.tabs.overview'), icon: Globe },
    {
      href: '/website/appearance',
      label: t('website.tabs.appearance'),
      icon: Layout
    },
    { href: '/website/pages', label: t('website.tabs.pages'), icon: FileText },
    { href: '/website/seo', label: t('website.tabs.seo'), icon: Search },
    {
      href: '/website/trust',
      label: t('website.tabs.trust'),
      icon: BadgeCheck
    },
    { href: '/website/domain', label: t('website.tabs.domain'), icon: Globe }
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-background px-4 sm:px-6">
      {tabs.map((tab) => {
        const active =
          tab.href === '/website'
            ? pathname === '/website'
            : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
