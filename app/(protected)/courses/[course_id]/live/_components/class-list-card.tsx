'use client';

import { useState, type ReactNode } from 'react';
import { CalendarClock, CalendarDays } from 'lucide-react';

import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { GroupStatusBadge } from '@/components/class/group-status-badge';
import { GroupTermRange } from '@/components/class/group-term-range';
import { SeatMeter } from '@/components/class/seat-meter';
import { DataList, DataPanel, type DataColumn } from '@/components/shared/data-list';
import { termStart } from '@/lib/class-slot-time';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { TutoringGroup } from '@/types/learning-operations';
import { EditClassSheet } from './edit-class-sheet';

interface ClassListCardProps {
  courseId: string;
  coursePublished: boolean;
  groups: TutoringGroup[];
  /** "Create class", shown in the panel header and again inside the empty state. */
  action?: ReactNode;
  emptyAction?: ReactNode;
  /** Refreshes the list after a class's settings, schedule or status changes. */
  onChanged?: () => void;
}

/** Without a group price there is nothing to sell a seat at, so say that instead. */
const emptyKey = (hasAction: boolean) =>
  hasAction ? 'courses.live.noClassesYet' : 'courses.live.needsPriceBeforeSchedule';

function classListColumns(
  t: ReturnType<typeof useTranslation>['t'],
  onEdit: (id: string) => void,
): DataColumn<TutoringGroup>[] {
  return [
    {
      id: 'title',
      header: t('tutoring.groups.columnTitle'),
      cell: (group) => (
        <button
          type="button"
          onClick={() => onEdit(group.id)}
          className="text-start font-medium hover:underline"
        >
          {group.title}
        </button>
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
      id: 'term',
      header: t('courses.live.termColumn'),
      cell: (group) => (
        <span className="text-xs text-muted-foreground">
          <GroupTermRange group={group} />
        </span>
      ),
    },
    {
      id: 'seats',
      header: t('tutoring.groups.columnSeats'),
      className: 'w-40',
      cell: (group) => (
        <SeatMeter taken={group.seats_taken} capacity={group.capacity} held={group.seats_held} />
      ),
    },
    {
      id: 'status',
      header: t('tutoring.groups.columnStatus'),
      align: 'center',
      cell: (group) => <GroupStatusBadge status={group.status} />,
    },
  ];
}

/**
 * One card in the mobile grid. Fixed height so a row of these lines up even
 * when one class has a longer title or a busier weekly schedule than the
 * next: the schedule line clamps instead of pushing the seat meter down, and
 * the meter always sits on the bottom edge.
 */
function ClassListMobileCard({ group, onOpen }: { group: TutoringGroup; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-full w-full flex-col gap-2.5 rounded-xl border p-4 text-start transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 min-w-0 flex-1 font-medium">{group.title}</span>
        <GroupStatusBadge status={group.status} />
      </div>
      <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
        <CalendarDays className="mt-1 h-3.5 w-3.5 shrink-0" />
        <GroupScheduleSummary
          slots={group.Slots}
          startsOn={termStart(group)}
          timezone={group.timezone}
          className="line-clamp-2 min-w-0 flex-1"
        />
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
        <GroupTermRange group={group} />
      </p>
      <SeatMeter
        taken={group.seats_taken}
        capacity={group.capacity}
        held={group.seats_held}
        className="mt-auto pt-1"
      />
    </button>
  );
}

/**
 * The classes this course runs, one row each. Everything about a single class
 * lives on its own page, so this stays a list instead of growing into a stack
 * of full panels the manager has to scroll past.
 */
export function ClassListCard({
  courseId,
  coursePublished,
  groups,
  action,
  emptyAction,
  onChanged,
}: ClassListCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <DataPanel
      title={t('courses.live.classesTitle')}
      subtitle={t('courses.live.classesCount', {
        count: formatNumber(groups.length),
      })}
      actions={groups.length > 0 ? action : null}
    >
      <DataList
        items={groups}
        columns={classListColumns(t, setEditingId)}
        rowKey={(group) => group.id}
        renderCard={(group) => (
          <ClassListMobileCard group={group} onOpen={() => setEditingId(group.id)} />
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

      {editingId && (
        <EditClassSheet
          courseId={courseId}
          coursePublished={coursePublished}
          groupId={editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          onChanged={() => onChanged?.()}
        />
      )}
    </DataPanel>
  );
}
