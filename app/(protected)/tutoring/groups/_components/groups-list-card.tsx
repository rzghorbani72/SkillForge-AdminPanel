'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataList } from '@/components/shared/data-list/data-list';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { termStart } from '@/lib/class-slot-time';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';
import type { TutoringGroup } from '@/types/learning-operations';
import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { GroupStatusBadge } from '@/components/class/group-status-badge';

type Props = {
  groups: TutoringGroup[];
  loading: boolean;
  saving: boolean;
  onPublish: (groupId: string) => void;
};

export const GroupsListCard = ({ groups, loading, saving, onPublish }: Props) => {
  const { t, language } = useTranslation();

  /** A class is run inside its course; the old address only forwards there. */
  const classHref = (group: TutoringGroup) =>
    group.Course ? `/courses/${group.Course.id}/live/${group.id}` : `/tutoring/groups/${group.id}`;

  const seats = (group: TutoringGroup) =>
    `${formatNumber(group.seats_taken, language)} / ${formatNumber(group.capacity, language)}${
      group.seats_held
        ? ` (${t('courses.live.seatsHeld', { held: formatNumber(group.seats_held, language) })})`
        : ''
    }`;

  const publishButton = (group: TutoringGroup) =>
    group.status === 'DRAFT' ? (
      <Button size="sm" variant="outline" disabled={saving} onClick={() => onPublish(group.id)}>
        {t('tutoring.groups.publish')}
      </Button>
    ) : null;

  return (
    <DataPanel title={t('tutoring.groups.listTitle')} subtitle={t('tutoring.groups.listSubtitle')}>
      <DataList
        items={groups}
        isLoading={loading}
        rowKey={(group) => group.id}
        emptyState={
          <p className="p-6 text-center text-sm text-muted-foreground">
            {t('tutoring.groups.empty')}
          </p>
        }
        columns={[
          {
            id: 'title',
            header: t('tutoring.groups.columnTitle'),
            cell: (group) => (
              <Link href={classHref(group)} className="font-medium hover:underline">
                {group.title}
              </Link>
            ),
          },
          {
            id: 'schedule',
            header: t('tutoring.groups.columnSchedule'),
            cell: (group) => (
              <GroupScheduleSummary
                slots={group.Slots}
                startsOn={termStart(group)}
                timezone={group.timezone}
              />
            ),
          },
          {
            id: 'seats',
            header: t('tutoring.groups.columnSeats'),
            cell: (group) => seats(group),
            align: 'center',
          },
          {
            id: 'min',
            header: t('tutoring.groups.columnMin'),
            cell: (group) => formatNumber(group.min_students, language),
            align: 'center',
          },
          {
            id: 'status',
            header: t('tutoring.groups.columnStatus'),
            cell: (group) => <GroupStatusBadge status={group.status} />,
            align: 'center',
          },
          {
            id: 'actions',
            header: '',
            cell: publishButton,
            align: 'end',
          },
        ]}
        renderCard={(group) => (
          <div className="space-y-2 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <Link href={classHref(group)} className="font-medium hover:underline">
                {group.title}
              </Link>
              <GroupStatusBadge status={group.status} />
            </div>
            <GroupScheduleSummary
              slots={group.Slots}
              startsOn={termStart(group)}
              timezone={group.timezone}
            />
            <p className="text-xs text-muted-foreground">
              {t('tutoring.groups.columnSeats')}: {seats(group)} · {t('tutoring.groups.columnMin')}:{' '}
              {formatNumber(group.min_students, language)}
            </p>
            {publishButton(group)}
          </div>
        )}
      />
    </DataPanel>
  );
};
