'use client';

import { cn } from '@/lib/utils';
import type { Academy } from '@/types/api';

export interface AcademyRow extends Academy {
  course_count?: number;
  student_count?: number;
}

export function canEnterAcademy(academy: Academy, isCurrent: boolean): boolean {
  return (
    !isCurrent &&
    ['AFFILIATE', 'TEACHER', 'MANAGER', 'ADMIN'].includes(
      (academy.userRole ?? '').toUpperCase()
    )
  );
}

export function canEditAcademy(academy: Academy): boolean {
  return ['MANAGER', 'ADMIN'].includes((academy.userRole ?? '').toUpperCase());
}

export function academyDomain(academy: Academy): string {
  return (
    academy.domain?.private_address ??
    academy.Domain?.private_address ??
    academy.slug ??
    ''
  );
}

export function AcademyStatusPill({
  academy,
  t
}: {
  academy: Academy;
  t: (key: string) => string;
}) {
  const siteDisabled = Boolean(academy.site_disabled_at);
  const isActive = academy.is_active !== false;
  const tone = siteDisabled
    ? 'bg-warning/10 text-warning'
    : isActive
      ? 'bg-success/10 text-success'
      : 'bg-muted text-muted-foreground';
  const dot = siteDisabled
    ? 'bg-warning'
    : isActive
      ? 'bg-success'
      : 'bg-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {siteDisabled
        ? t('stores.statusSiteDisabled')
        : isActive
          ? t('stores.statusActive')
          : t('stores.statusPaused')}
    </span>
  );
}
