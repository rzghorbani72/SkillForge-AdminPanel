'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Radio } from 'lucide-react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { validateLiveForPublish } from '@/components/course/course-drafts';
import { useLiveCourse } from './hooks/use-live-course';
import TopicListEditor from './_components/topic-list-editor';
import LivePricingCard from './_components/live-pricing-card';
import ScheduleBuilder from './_components/schedule-builder';
import ClassPanel from './_components/class-panel';

/**
 * Building a live course, in the order a teacher actually thinks: what it
 * covers, what it costs, when it meets, and then what each meeting is called.
 * Each step unlocks the next, so an empty page never asks for a class before
 * there is a price to sell a seat at.
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
  const publishBlocker = useMemo(
    () =>
      validateLiveForPublish({
        topics: topics.length,
        classes: groups.length,
        classesWithSchedule: groups.filter((group) => group.Slots?.length)
          .length,
        sellingOffers: offers.filter((offer) => offer.is_active !== false)
          .length
      }),
    [topics, groups, offers]
  );

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
      <div className="container mx-auto flex h-64 items-center justify-center py-6">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto flex h-64 flex-col items-center justify-center gap-4 py-6 text-center">
        <h2 className="text-2xl font-bold">{t('courses.courseNotFound')}</h2>
        <Button variant="outline" onClick={() => router.push('/courses')}>
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {t('courses.backToCourses')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">{course.title}</h2>
            <Badge variant={course.is_published ? 'default' : 'outline'}>
              {course.is_published
                ? t('courses.published')
                : t('courses.draft')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('courses.live.pageSubtitle')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            type="button"
            onClick={publish}
            disabled={
              isPublishing || Boolean(publishBlocker) || course.is_published
            }
          >
            {isPublishing ? t('common.saving') : t('courses.publishCourse')}
          </Button>
          {publishBlocker && !course.is_published && (
            <p className="text-xs text-muted-foreground">{t(publishBlocker)}</p>
          )}
        </div>
      </div>

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

      {groupOffer ? (
        <ScheduleBuilder
          offerId={groupOffer.id}
          courseTitle={course.title}
          onCreated={() => void reload()}
        />
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t('courses.live.needsPriceBeforeSchedule')}
        </p>
      )}

      {groups.map((group) => (
        <ClassPanel
          key={group.id}
          group={group}
          topics={topics}
          onPublished={() => void reload()}
        />
      ))}
    </div>
  );
}
