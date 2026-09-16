'use client';

import { ClassInviteBlock } from '@/components/class/class-invite-block';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { termStart } from '@/lib/class-slot-time';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { formatNumber } from '@/lib/utils';
import type { TutoringGroup } from '@/types/learning-operations';

function SeatFacts({ group }: { group: TutoringGroup }) {
  const { t, language } = useTranslation();

  return (
    <div>
      <dt className="text-xs text-muted-foreground">{t('tutoring.groups.columnSeats')}</dt>
      <dd className="text-lg font-semibold">
        {formatNumber(group.seats_taken, language)} / {formatNumber(group.capacity, language)}
      </dd>
      {group.seats_held ? (
        <dd className="text-xs text-muted-foreground">
          {t('courses.live.seatsHeld', {
            held: formatNumber(group.seats_held, language),
          })}{' '}
          · {t('courses.live.heldHint')}
        </dd>
      ) : null}
    </div>
  );
}

/** The facts a manager checks first: who fits, when it starts, how to join. */
export function ClassSummaryCard({
  group,
  coursePublished,
}: {
  group: TutoringGroup;
  coursePublished: boolean;
}) {
  const { t, language } = useTranslation();
  const formatDate = useDateFormat();
  const seatsNeeded = Math.max(group.min_students - group.seats_taken, 0);

  return (
    <DataPanel
      title={t('tutoring.groups.summaryTitle')}
      subtitle={
        group.status === 'WAITING' && seatsNeeded > 0 ? t('tutoring.groups.needsMore') : undefined
      }
    >
      <dl className="grid gap-4 p-5 sm:grid-cols-3">
        <SeatFacts group={group} />
        <div>
          <dt className="text-xs text-muted-foreground">{t('tutoring.groups.columnMin')}</dt>
          <dd className="text-lg font-semibold">{formatNumber(group.min_students, language)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('tutoring.groups.startsOn')}</dt>
          <dd className="text-lg font-semibold">
            {termStart(group) ? formatDate(termStart(group) ?? '') : '—'}
          </dd>
        </div>
        <div className="sm:col-span-3">
          <dt className="text-xs text-muted-foreground">{t('tutoring.groups.columnSchedule')}</dt>
          <dd className="mt-1">
            <GroupScheduleSummary
              slots={group.Slots}
              startsOn={termStart(group)}
              timezone={group.timezone}
            />
          </dd>
        </div>
        <div className="sm:col-span-3">
          <ClassInviteBlock
            joinCode={group.join_code}
            coursePublished={coursePublished}
            classStatus={group.status}
          />
        </div>
      </dl>
    </DataPanel>
  );
}
