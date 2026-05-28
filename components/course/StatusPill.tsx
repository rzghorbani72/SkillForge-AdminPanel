'use client';

import { useTranslation } from '@/lib/i18n/hooks';

type StatusKey = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'REVIEW' | string;

export function StatusPill({ status }: { status: StatusKey }) {
  const { t } = useTranslation();
  const s = (status || '').toUpperCase();

  if (s === 'PUBLISHED')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t('courses.published')}
      </span>
    );
  if (s === 'DRAFT')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {t('courses.draft')}
      </span>
    );
  if (s === 'REVIEW')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        {t('courses.review')}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {status}
    </span>
  );
}
