'use client';

import { Button } from '@/components/ui/button';
import { ClassHomeworkCard } from '@/components/class/class-homework-card';
import { ClassTimetableCard } from '@/components/class/class-timetable-card';
import { NextSessionCard } from '@/components/class/next-session-card';
import { GroupActionsCard } from '@/components/class/group-actions-card';
import { GroupRosterCard } from '@/components/class/group-roster-card';
import { GroupStatusBadge } from '@/components/class/group-status-badge';
import { useClassDetail } from '@/hooks/use-class-detail';
import { useClassSessions } from '@/hooks/use-class-sessions';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseTopic, TutoringGroup } from '@/types/learning-operations';
import { ClassSummaryCard } from './class-summary-card';

export function ClassLoadedView({
  group,
  coursePublished,
  topics,
  detail,
  timetable,
}: {
  group: TutoringGroup;
  coursePublished: boolean;
  topics: CourseTopic[];
  detail: ReturnType<typeof useClassDetail>;
  timetable: ReturnType<typeof useClassSessions>;
}) {
  const { t } = useTranslation();

  const publish = async () => {
    if (await detail.publish()) await timetable.reload();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{group.title}</h1>
          <GroupStatusBadge status={group.status} />
        </div>
        {group.status === 'DRAFT' && (
          <Button type="button" size="sm" disabled={detail.busy} onClick={() => void publish()}>
            {detail.busy ? t('common.saving') : t('courses.live.publishClass')}
          </Button>
        )}
      </div>

      <ClassSummaryCard group={group} coursePublished={coursePublished} />

      <NextSessionCard sessions={timetable.sessions} classMeetingUrl={group.meeting_url} />

      <GroupRosterCard
        members={group.members ?? []}
        busy={detail.busy}
        onRemove={(profileId) => void detail.removeMember(profileId)}
      />

      <GroupActionsCard
        group={group}
        busy={detail.busy}
        onUpdateLink={(url, notify, regenerate) => void detail.updateLink(url, notify, regenerate)}
        onUpdateBackupLink={(url) => void detail.updateBackupLink(url)}
        onAnnounce={(body, sms) => void detail.announce(body, sms)}
        onConfirm={() => void detail.confirm()}
        onCancel={(payload) => detail.cancel(payload)}
      />

      <ClassTimetableCard
        sessions={timetable.sessions}
        topics={topics}
        isLoading={timetable.isLoading}
        onSessionChanged={timetable.replace}
        onCancelled={timetable.reload}
      />

      <ClassHomeworkCard groupId={group.id} sessions={timetable.sessions} />
    </>
  );
}
