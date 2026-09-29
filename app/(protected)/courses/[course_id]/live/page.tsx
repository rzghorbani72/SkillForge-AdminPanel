'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { liveSetupSteps } from '@/components/course/live/live-setup-steps';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useLiveCourse } from './hooks/use-live-course';
import { publishDraftClasses } from './hooks/publish-draft-classes';
import { LiveCourseLoaded } from './_components/live-course-loaded';

function LiveCourseSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

function LiveCourseMissing() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-lg font-semibold">{t('courses.courseNotFound')}</h2>
      <Button variant="outline" onClick={() => router.push('/courses')}>
        <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
        {t('courses.backToCourses')}
      </Button>
    </div>
  );
}

/**
 * Building a live course, in the order a teacher actually thinks: what it
 * covers, what it costs, and when it meets. The checklist on top is the whole
 * navigation — it says how far the course got and which single thing is left,
 * so the page never reads as four unrelated forms.
 */
export default function LiveCoursePage() {
  const { t } = useTranslation();
  const params = useParams();
  const courseId = params.course_id as string;
  const { course, topics, offers, groups, isLoading, reload, patch } = useLiveCourse(courseId);
  const [isPublishing, setIsPublishing] = useState(false);

  const steps = useMemo(
    () =>
      liveSetupSteps({
        topics: topics.length,
        classes: groups.length,
        classesWithSchedule: groups.filter((group) => group.Slots?.length).length,
        sellingOffers: offers.filter((offer) => offer.is_active !== false).length,
      }),
    [topics, groups, offers],
  );

  const publish = async () => {
    setIsPublishing(true);
    try {
      await apiClient.updateCourse(courseId, { published: true });
      toast.success(t('courses.live.coursePublished'));
      const stayedDraft = await publishDraftClasses(groups);
      if (stayedDraft > 0) toast.warning(t('courses.live.classesStayedDraft'));
      await reload();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) return <LiveCourseSkeleton />;
  if (!course) return <LiveCourseMissing />;

  return (
    <LiveCourseLoaded
      courseId={courseId}
      course={course}
      topics={topics}
      offers={offers}
      groups={groups}
      steps={steps}
      ready={steps.every((step) => step.done)}
      isPublishing={isPublishing}
      onPublish={() => void publish()}
      onReload={() => void reload()}
      onTopicsSaved={(saved) => patch({ topics: saved })}
    />
  );
}
