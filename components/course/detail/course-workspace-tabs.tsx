'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, CreditCard, Layers } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type CourseWorkspaceTabsProps = {
  courseId: string;
};

/**
 * Real links, not a JS tab widget: every tab is a URL the manager can share,
 * bookmark or open in a new tab.
 */
export function CourseWorkspaceTabs({ courseId }: CourseWorkspaceTabsProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const base = `/courses/${courseId}`;

  const tabs = [
    {
      href: base,
      label: t('courseDetail.tabOverview'),
      icon: BarChart3,
      exact: true
    },
    {
      href: `${base}/seasons`,
      label: t('courseDetail.curriculum'),
      icon: Layers,
      exact: false
    },
    {
      href: `${base}/plans`,
      label: t('courseDetail.paymentPlansLink'),
      icon: CreditCard,
      exact: false
    }
  ];

  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
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
