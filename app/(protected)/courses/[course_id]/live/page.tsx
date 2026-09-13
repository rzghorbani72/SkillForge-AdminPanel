'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Globe } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveSetupChecklist } from '@/components/course/live/live-setup-checklist';
import { liveSetupSteps } from '@/components/course/live/live-setup-steps';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useLiveCourse } from './hooks/use-live-course';
import TopicListEditor from './_components/topic-list-editor';
import LivePricingCard from './_components/live-pricing-card';
import { CreateClassSheet } from './_components/create-class-sheet';
import { ClassListCard } from './_components/class-list-card';

/**
 * Building a live course, in the order a teacher actually thinks: what it
 * covers, what it costs, and when it meets. The checklist on top is the whole
 * navigation — it says how far the course got and which single thing is left,
 * so the page never reads as four unrelated forms.
 */
export default function LiveCoursePage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const courseId = params.course_id as string;
  const { course, topics, offers, groups, isLoading, reload, patch } =
    useLiveCourse(courseId);
  const [isPublishing, setIsPublishing] = useState(false);

  const groupOffer = offers.find((offer) => offer.kind === 'GROUP');
  const steps = useMemo(
    () =>
      liveSetupSteps({
        topics: topics.length,
        classes: groups.length,
        classesWithSchedule: groups.filter((group) => group.Slots?.length)
          .length,
        sellingOffers: offers.filter((offer) => offer.is_active !== false)
          .length
      }),
    [topics, groups, offers]
  );
  const ready = steps.every((step) => step.done);

  const publish = async () => {
    setIsPublishing(true);
    try {
      await apiClient.updateCourse(courseId, { published: true });
      toast.success(t('courses.live.coursePublished'));
      await reload();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
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

  if (!course) {
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

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <LiveSetupChecklist
        steps={steps}
        action={
          ready && !course.is_published ? (
            <Button type="button" onClick={publish} disabled={isPublishing}>
              <Globe className="me-1.5 h-4 w-4" />
              {isPublishing ? t('common.saving') : t('courses.publishCourse')}
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopicListEditor
          courseId={courseId}
          initial={topics}
          onSaved={(saved) => patch({ topics: saved })}
        />

        <LivePricingCard
          courseId={courseId}
          courseTitle={course.title}
          tutorProfileId={String(course.author_id)}
          offers={offers}
          onSaved={() => void reload()}
        />
      </div>

      <ClassListCard
        courseId={courseId}
        groups={groups}
        onChanged={() => void reload()}
        action={
          groupOffer ? (
            <CreateClassSheet
              offerId={groupOffer.id}
              courseTitle={course.title}
              onCreated={() => void reload()}
            />
          ) : null
        }
        emptyAction={
          groupOffer ? (
            <CreateClassSheet
              offerId={groupOffer.id}
              courseTitle={course.title}
              onCreated={() => void reload()}
              variant="cta"
            />
          ) : null
        }
      />
    </div>
  );
}
