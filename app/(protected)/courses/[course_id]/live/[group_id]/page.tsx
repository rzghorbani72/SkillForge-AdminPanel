'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import { Button } from '@/components/ui/button';
import { ClassHomeworkCard } from '@/components/class/class-homework-card';
import { ClassTimetableCard } from '@/components/class/class-timetable-card';
import { GroupActionsCard } from '@/components/class/group-actions-card';
import { GroupRosterCard } from '@/components/class/group-roster-card';
import { GroupStatusBadge } from '@/components/class/group-status-badge';
import { useClassDetail } from '@/hooks/use-class-detail';
import { useClassSessions } from '@/hooks/use-class-sessions';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseTopic } from '@/types/learning-operations';
import { ClassSummaryCard } from './_components/class-summary-card';

/**
 * One class, on one page: who is in it, when it meets, what each meeting
 * covers, and the homework it owes. Running a class used to mean moving
 * between the course tab and the tutoring section — everything is here now.
 */
export default function ClassPage() {
  const { course_id: courseId, group_id: groupId } = useParams<{
    course_id: string;
    group_id: string;
  }>();
  const { t } = useTranslation();
  const detail = useClassDetail(groupId);
  const timetable = useClassSessions(groupId);
  const [topics, setTopics] = useState<CourseTopic[]>([]);

  useEffect(() => {
    apiClient
      .getCourseTopics(courseId)
      .then(setTopics)
      .catch(() => setTopics([]));
  }, [courseId]);

  const group = detail.group;

  const publish = async () => {
    if (await detail.publish()) await timetable.reload();
  };

  return (
    <LearningNavGate requiredCapability="tutoring">
      <main className="space-y-6 p-4 sm:p-6">
        <Link
          href={`/courses/${courseId}/live`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('courses.live.backToClasses')}
        </Link>

        {detail.loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : !group ? (
          <p className="text-sm text-muted-foreground">
            {t('tutoring.groups.notFound')}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {group.title}
                </h1>
                <GroupStatusBadge status={group.status} />
              </div>
              {group.status === 'DRAFT' && (
                <Button
                  type="button"
                  size="sm"
                  disabled={detail.busy}
                  onClick={() => void publish()}
                >
                  {detail.busy
                    ? t('common.saving')
                    : t('courses.live.publishClass')}
                </Button>
              )}
            </div>

            <ClassSummaryCard group={group} />

            <GroupRosterCard
              members={group.members ?? []}
              busy={detail.busy}
              onRemove={(profileId) => void detail.removeMember(profileId)}
            />

            <GroupActionsCard
              group={group}
              busy={detail.busy}
              onUpdateLink={(url, notify) =>
                void detail.updateLink(url, notify)
              }
              onAnnounce={(body, sms) => void detail.announce(body, sms)}
              onConfirm={() => void detail.confirm()}
              onCancel={(reason) => void detail.cancel(reason)}
            />

            <ClassTimetableCard
              sessions={timetable.sessions}
              topics={topics}
              isLoading={timetable.isLoading}
              onSessionChanged={timetable.replace}
            />

            <ClassHomeworkCard
              groupId={group.id}
              sessions={timetable.sessions}
            />
          </>
        )}
      </main>
    </LearningNavGate>
  );
}
