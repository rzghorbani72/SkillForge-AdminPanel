'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NoAcademyState from '@/components/course/NoAcademyState';
import { secondsToDuration } from '@/components/course/course-drafts';
import { CourseStudentPreview } from '@/components/course/student-preview';
import { countLessons } from '@/components/course/detail/types';
import type { CourseDetail } from '@/components/course/detail/types';
import { useCourseWorkspace } from '@/components/course/detail/course-workspace-context';
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

/**
 * The course exactly as a student sees it on the public site. It is the first
 * thing a manager should check, so it is the workspace's landing tab.
 */
export default function CourseOverviewPage() {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();
  const { course, loading } = useCourseWorkspace();

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
  const totalSeconds = seasons.reduce(
    (total, season) =>
      total + season.Lesson.reduce((sum, lesson) => sum + lesson.duration, 0),
    0
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 space-y-4 p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">
        {t('courseDetail.overviewHint')}
      </p>

      <CourseStudentPreview
        course={{
          title: course.title,
          description: course.description ?? '',
          coverUrl: coverUrl(course),
          categoryName: course.Category?.name ?? null,
          published: course.is_published,
          price: course.price,
          beforeDiscount: course.original_price || null,
          lessonCount: countLessons(seasons),
          totalSeconds,
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
  );
}
