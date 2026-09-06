'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, BarChart3, Pencil, Radio } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type CourseWorkspaceTabsProps = {
  courseId: string;
  courseType?: 'OFFLINE' | 'LIVE';
  /** The certificates tab only exists for a course that awards one. */
  hasCertificate?: boolean;
};

/**
 * Real links, not a JS tab widget: every tab is a URL the manager can share,
 * bookmark or open in a new tab.
 */
export function CourseWorkspaceTabs({
  courseId,
  courseType = 'OFFLINE',
  hasCertificate = false
}: CourseWorkspaceTabsProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const base = `/courses/${courseId}`;

  const tabs = [
    // Building the course comes first — a live course is built on its
    // timetable, a recorded one in the step builder.
    courseType === 'LIVE'
      ? {
          href: `${base}/live`,
          label: t('courseDetail.classroom'),
          icon: Radio,
          exact: false
        }
      : {
          href: `${base}/edit`,
          label: t('courses.wizard.tabBuilder'),
          icon: Pencil,
          exact: false
        },
    {
      href: base,
      label: t('courseDetail.tabFinancial'),
      icon: BarChart3,
      exact: true
    }
    // Instalment plans are hidden until a gateway supports them; the page and
    // its route still exist, so restoring this entry is the whole change.
  ];

  if (hasCertificate) {
    tabs.push({
      href: `${base}/certificates`,
      label: t('certificates.tab'),
      icon: Award,
      exact: false
    });
  }

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
