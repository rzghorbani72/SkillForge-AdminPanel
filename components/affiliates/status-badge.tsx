'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { Affiliate } from './types';

export function StatusBadge({ aff }: { aff: Affiliate }) {
  const { t } = useTranslation();

  if (!aff.is_active || aff.status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        {t('affiliates.inactive')}
      </span>
    );
  }
  if (aff.status === 'top') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {t('affiliates.statusTop')}
      </span>
    );
  }
  if (aff.status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
        {t('affiliates.statusPending')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {t('affiliates.active')}
    </span>
  );
}
