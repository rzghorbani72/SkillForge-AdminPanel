'use client';

import { DataPanel } from '@/components/shared/data-list/data-panel';
import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { termStart } from '@/lib/class-slot-time';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { formatNumber } from '@/lib/utils';
import type { TutoringGroup } from '@/types/learning-operations';

/** The facts a manager checks first: who fits, when it starts, how to join. */
export function ClassSummaryCard({ group }: { group: TutoringGroup }) {
  const { t, language } = useTranslation();
  const formatDate = useDateFormat();
  const seatsNeeded = Math.max(group.min_students - group.seats_taken, 0);

  return (
    <DataPanel
      title={t('tutoring.groups.summaryTitle')}
      subtitle={
        group.status === 'WAITING' && seatsNeeded > 0
          ? t('tutoring.groups.needsMore')
          : undefined
      }
    >
      <dl className="grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">
            {t('tutoring.groups.columnSeats')}
          </dt>
          <dd className="text-lg font-semibold">
            {formatNumber(group.seats_taken, language)} /{' '}
            {formatNumber(group.capacity, language)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t('tutoring.groups.columnMin')}
          </dt>
          <dd className="text-lg font-semibold">
            {formatNumber(group.min_students, language)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t('tutoring.groups.startsOn')}
          </dt>
          <dd className="text-lg font-semibold">
            {termStart(group) ? formatDate(termStart(group) ?? '') : '—'}
          </dd>
        </div>
        <div className="sm:col-span-3">
          <dt className="text-xs text-muted-foreground">
            {t('tutoring.groups.columnSchedule')}
          </dt>
          <dd className="mt-1">
            <GroupScheduleSummary
              slots={group.Slots}
              startsOn={termStart(group)}
              timezone={group.timezone}
            />
          </dd>
        </div>
        {group.age_min || group.age_max ? (
          <div>
            <dt className="text-xs text-muted-foreground">
              {t('tutoring.groups.ageRange')}
            </dt>
            <dd>
              {formatNumber(group.age_min ?? 0, language)}–
              {formatNumber(group.age_max ?? 0, language)}
            </dd>
          </div>
        ) : null}
        {group.join_code ? (
          <div>
            <dt className="text-xs text-muted-foreground">
              {t('tutoring.groups.joinCode')}
            </dt>
            <dd className="text-sm" dir="ltr">
              {group.join_code}
            </dd>
          </div>
        ) : null}
      </dl>
    </DataPanel>
  );
}
