'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { TICKET_PRIORITIES, TICKET_STATUSES } from './staff-support-types';

const field =
  'h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring';

export interface SupportInboxFiltersState {
  status: string;
  priority: string;
  academy_id: string;
}

interface Props {
  tab: 'academy' | 'platform';
  filters: SupportInboxFiltersState;
  onChange: (next: SupportInboxFiltersState) => void;
}

export function SupportInboxFilters({ tab, filters, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={t('support.filters.status')}
        className={field}
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        <option value="">{t('support.filters.allStatuses')}</option>
        {TICKET_STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`support.statuses.${s}`)}
          </option>
        ))}
      </select>
      <select
        aria-label={t('support.filters.priority')}
        className={field}
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
      >
        <option value="">{t('support.filters.allPriorities')}</option>
        {TICKET_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {t(`support.priorities.${p}`)}
          </option>
        ))}
      </select>
      {tab === 'platform' && (
        <input
          className={`${field} min-w-[140px]`}
          placeholder={t('support.filters.academyId')}
          value={filters.academy_id}
          onChange={(e) => onChange({ ...filters, academy_id: e.target.value })}
        />
      )}
    </div>
  );
}
