'use client';

import { cn } from '@/lib/utils';
import type { Academy } from '@/types/api';

export interface AcademyRow extends Academy {
  course_count?: number;
  student_count?: number;
}

export function canEnterAcademy(academy: Academy): boolean {
  return ['AFFILIATE', 'TEACHER', 'MANAGER', 'ADMIN'].includes(
    (academy.userRole ?? '').toUpperCase()
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

export type AcademyStatus = 'active' | 'paused' | 'siteDisabled';

/**
 * One source of truth for "is this academy running?". A manager deactivates an
 * academy through the site-status dialog (`site_disabled_at`), so reading only
 * `is_active` made the header and the filter disagree with the card.
 */
export function academyStatus(academy: Academy): AcademyStatus {
  if (academy.site_disabled_at) return 'siteDisabled';
  if (academy.is_active === false) return 'paused';
  return 'active';
}

const STATUS_STYLE: Record<
  AcademyStatus,
  { tone: string; dot: string; label: string }
> = {
  active: {
    tone: 'bg-success/10 text-success',
    dot: 'bg-success',
    label: 'stores.statusActive'
  },
  paused: {
    tone: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    label: 'stores.statusPaused'
  },
  siteDisabled: {
    tone: 'bg-warning/10 text-warning',
    dot: 'bg-warning',
    label: 'stores.statusSiteDisabled'
  }
};

export function AcademyStatusPill({
  academy,
  dotOnly = false,
  t
}: {
  academy: Academy;
  dotOnly?: boolean;
  t: (key: string) => string;
}) {
  const style = STATUS_STYLE[academyStatus(academy)];
  const dot = (
    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', style.dot)} />
  );

  if (dotOnly) return <span title={t(style.label)}>{dot}</span>;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        style.tone
      )}
    >
      {dot}
      {t(style.label)}
    </span>
  );
}
