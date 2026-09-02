'use client';

import Link from 'next/link';
import { CalendarDays, Users } from 'lucide-react';

import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { GroupStatusBadge } from '@/components/class/group-status-badge';
import { DataList, type DataColumn } from '@/components/shared/data-list';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { TutoringGroup } from '@/types/learning-operations';

interface ClassListCardProps {
  courseId: string;
  groups: TutoringGroup[];
}

/**
 * The classes this course runs, one row each. Everything about a single class
 * lives on its own page, so this stays a list instead of growing into a stack
 * of full panels the manager has to scroll past.
 */
export function ClassListCard({ courseId, groups }: ClassListCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  const href = (group: TutoringGroup) =>
    `/courses/${courseId}/live/${group.id}`;

  const columns: DataColumn<TutoringGroup>[] = [
    {
      id: 'title',
      header: t('tutoring.groups.columnTitle'),
      cell: (group) => (
        <Link href={href(group)} className="font-medium hover:underline">
          {group.title}
        </Link>
      )
    },
    {
      id: 'schedule',
      header: t('tutoring.groups.columnSchedule'),
      cell: (group) => <GroupScheduleSummary slots={group.Slots} />
    },
    {
      id: 'seats',
      header: t('tutoring.groups.columnSeats'),
      align: 'center',
      cell: (group) =>
        t('courses.live.seatsTaken', {
          taken: formatNumber(group.seats_taken),
          capacity: formatNumber(group.capacity)
        })
    },
    {
      id: 'status',
      header: t('tutoring.groups.columnStatus'),
      align: 'center',
      cell: (group) => <GroupStatusBadge status={group.status} />
    }
  ];

  return (
    <DataList
      items={groups}
      columns={columns}
      rowKey={(group) => group.id}
      renderCard={(group) => (
        <Link
          href={href(group)}
          className="block space-y-2 rounded-lg border p-4 hover:bg-muted/50"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{group.title}</span>
            <GroupStatusBadge status={group.status} />
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <GroupScheduleSummary slots={group.Slots} />
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {t('courses.live.seatsTaken', {
              taken: formatNumber(group.seats_taken),
              capacity: formatNumber(group.capacity)
            })}
          </p>
        </Link>
      )}
      emptyState={
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t('courses.live.noClassesYet')}
        </p>
      }
    />
  );
}
