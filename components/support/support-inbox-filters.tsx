'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TICKET_PRIORITIES, TICKET_STATUSES } from './staff-support-types';

const ALL = 'ALL';

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
      <Select
        value={filters.status || ALL}
        onValueChange={(v) =>
          onChange({ ...filters, status: v === ALL ? '' : v })
        }
      >
        <SelectTrigger
          className="h-9 w-[140px]"
          aria-label={t('support.filters.status')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>
            {t('support.filters.allStatuses')}
          </SelectItem>
          {TICKET_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`support.statuses.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || ALL}
        onValueChange={(v) =>
          onChange({ ...filters, priority: v === ALL ? '' : v })
        }
      >
        <SelectTrigger
          className="h-9 w-[130px]"
          aria-label={t('support.filters.priority')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>
            {t('support.filters.allPriorities')}
          </SelectItem>
          {TICKET_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {t(`support.priorities.${p}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {tab === 'platform' && (
        <Input
          className="h-9 w-[160px]"
          placeholder={t('support.filters.academyId')}
          value={filters.academy_id}
          onChange={(e) => onChange({ ...filters, academy_id: e.target.value })}
        />
      )}
    </div>
  );
}
