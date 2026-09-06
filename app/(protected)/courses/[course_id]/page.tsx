'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NoAcademyState from '@/components/course/NoAcademyState';
import { secondsToDuration } from '@/components/course/course-drafts';
import { CourseStudentPreview } from '@/components/course/student-preview';
import { CourseFactsCard } from '@/components/course/detail/course-facts-card';
import {
  CourseAccessCard,
  CourseIdentityCard,
  CourseSearchCard
} from '@/components/course/detail/course-spec-cards';
import { countLessons } from '@/components/course/detail/types';
import type { CourseDetail } from '@/components/course/detail/types';
import { useCourseWorkspace } from '@/components/course/detail/course-workspace-context';
import { useCourseTutoringOffers } from '@/components/course/pricing/use-course-tutoring-offers';
import { useStore } from '@/hooks/useStore';
import { langApiVersionPath } from '@/lib/api-lang';
import { useTranslation } from '@/lib/i18n/hooks';

function coverUrl(course: CourseDetail): string | null {
  const image = course.Image;
  if (!image) return null;
  return (
    image.publicUrl ??
    `${langApiVersionPath()}/images/fetch-image-by-id/${image.id}`
  );
}

function totalSeconds(course: CourseDetail): number {
  return (course.Season ?? []).reduce(
    (total, season) =>
      total + season.Lesson.reduce((sum, lesson) => sum + lesson.duration, 0),
    0
  );
}

/**
 * Everything the course is, on one page: the student's view on the left, and
 * its settings — pricing, access, search — as read-only cards on the right.
 * Editing any of it happens in the builder.
 */
export default function CourseOverviewPage() {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();
  const { course, loading } = useCourseWorkspace();
  // A live course is priced through its tutoring offers, not `course.price`.
  const offers = useCourseTutoringOffers(
    course?.course_type === 'LIVE' ? course.id : undefined
  );

  if (!selectedAcademy) return <NoAcademyState />;

  if (loading && !course) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <p className="text-muted-foreground">{t('courseDetail.notFound')}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/courses')}
          >
            {t('courseDetail.backToCourses')}
          </Button>
        </div>
      </div>
    );
  }

  const seasons = course.Season ?? [];

  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('courseDetail.overviewHint')}
          </p>
          <CourseStudentPreview
            showCurriculum={course.course_type !== 'LIVE'}
            course={{
              title: course.title,
              description: course.description ?? '',
              coverUrl: coverUrl(course),
              categoryName: course.Category?.name ?? null,
              published: course.is_published,
              price: course.price,
              beforeDiscount: course.original_price || null,
              lessonCount: countLessons(seasons),
              totalSeconds: totalSeconds(course),
              seasons: seasons.map((season) => ({
                key: season.id,
                title: season.title,
                lessons: season.Lesson.map((lesson) => ({
                  key: lesson.id,
                  title: lesson.title,
                  isFree: lesson.is_free,
                  duration: secondsToDuration(lesson.duration)
                }))
              }))
            }}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <CourseFactsCard course={course} offers={offers} />
          <CourseIdentityCard course={course} />
          <CourseAccessCard course={course} />
          <CourseSearchCard course={course} />
        </aside>
      </div>
    </div>
  );
}
