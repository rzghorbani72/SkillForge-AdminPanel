'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { CalendarDays, Users } from 'lucide-react';

import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { GroupStatusBadge } from '@/components/class/group-status-badge';
import { SeatMeter } from '@/components/class/seat-meter';
import {
  DataList,
  DataPanel,
  type DataColumn
} from '@/components/shared/data-list';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { TutoringGroup } from '@/types/learning-operations';

interface ClassListCardProps {
  courseId: string;
  groups: TutoringGroup[];
  /** "Create class", shown in the panel header and again inside the empty state. */
  action?: ReactNode;
  emptyAction?: ReactNode;
}

/** Without a group price there is nothing to sell a seat at, so say that instead. */
const emptyKey = (hasAction: boolean) =>
  hasAction
    ? 'courses.live.noClassesYet'
    : 'courses.live.needsPriceBeforeSchedule';

/**
 * The classes this course runs, one row each. Everything about a single class
 * lives on its own page, so this stays a list instead of growing into a stack
 * of full panels the manager has to scroll past.
 */
export function ClassListCard({
  courseId,
  groups,
  action,
  emptyAction
}: ClassListCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();

  const href = (group: TutoringGroup) =>
    `/courses/${courseId}/live/${group.id}`;

  const startLabel = (group: TutoringGroup) =>
    group.starts_on ? formatDate(group.starts_on) : '—';

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
      id: 'startsOn',
      header: t('courses.live.startDate'),
      cell: (group) => (
        <span className="text-xs text-muted-foreground">
          {startLabel(group)}
        </span>
      )
    },
    {
      id: 'seats',
      header: t('tutoring.groups.columnSeats'),
      className: 'w-40',
      cell: (group) => (
        <SeatMeter taken={group.seats_taken} capacity={group.capacity} />
      )
    },
    {
      id: 'status',
      header: t('tutoring.groups.columnStatus'),
      align: 'center',
      cell: (group) => <GroupStatusBadge status={group.status} />
    }
  ];

  return (
    <DataPanel
      title={t('courses.live.classesTitle')}
      subtitle={t('courses.live.classesCount', {
        count: formatNumber(groups.length)
      })}
      actions={groups.length > 0 ? action : null}
    >
      <DataList
        items={groups}
        columns={columns}
        rowKey={(group) => group.id}
        renderCard={(group) => (
          <Link
            href={href(group)}
            className="block space-y-2.5 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{group.title}</span>
              <GroupStatusBadge status={group.status} />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <GroupScheduleSummary slots={group.Slots} />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {t('courses.live.startsOn', { date: startLabel(group) })}
            </p>
            <SeatMeter taken={group.seats_taken} capacity={group.capacity} />
          </Link>
        )}
        cardGridClassName="grid gap-3 p-4 sm:grid-cols-2"
        emptyState={
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
            <p className="max-w-sm text-sm text-muted-foreground">
              {t(emptyKey(Boolean(emptyAction)))}
            </p>
            {emptyAction}
          </div>
        }
      />
    </DataPanel>
  );
}
