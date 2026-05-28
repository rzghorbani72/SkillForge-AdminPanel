'use client';

import { useTranslation } from '@/lib/i18n/hooks';

export function UserStatusPill({ status }: { status?: string }) {
  const { t } = useTranslation();
  const s = (status || '').toLowerCase();

  if (s === 'active')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        {t('common.active')}
      </span>
    );
  if (s === 'inactive')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {t('common.inactive')}
      </span>
    );
  if (s === 'pending')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        {t('teacherRequests.pending')}
      </span>
    );
  if (s === 'approved')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        {t('teacherRequests.approved')}
      </span>
    );
  if (s === 'rejected')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
        {t('teacherRequests.rejected')}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {status}
    </span>
  );
}
