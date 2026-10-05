'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import { useClassDetail } from '@/hooks/use-class-detail';
import { useClassSessions } from '@/hooks/use-class-sessions';
import { scheduleStepHref } from '@/components/course/wizard/live/class-url-intent';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseTopic } from '@/types/learning-operations';
import { ClassLoadedView } from './_components/class-loaded-view';

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
  const [coursePublished, setCoursePublished] = useState(false);

  useEffect(() => {
    apiClient
      .getCourseTopics(courseId)
      .then(setTopics)
      .catch(() => setTopics([]));
  }, [courseId]);

  useEffect(() => {
    apiClient
      .getCourse(courseId)
      .then((row) => setCoursePublished(Boolean(row?.is_published)))
      .catch(() => setCoursePublished(false));
  }, [courseId]);

  const group = detail.group;

  return (
    <LearningNavGate requiredCapability="tutoring">
      <main className="space-y-6 p-4 sm:p-6">
        <Link
          href={scheduleStepHref(courseId)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('courses.live.backToClasses')}
        </Link>

        {detail.loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : !group ? (
          <p className="text-sm text-muted-foreground">{t('tutoring.groups.notFound')}</p>
        ) : (
          <ClassLoadedView
            group={group}
            coursePublished={coursePublished}
            topics={topics}
            detail={detail}
            timetable={timetable}
          />
        )}
      </main>
    </LearningNavGate>
  );
}
