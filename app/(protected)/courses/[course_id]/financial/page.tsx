'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, CalendarDays, Percent, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NoAcademyState from '@/components/course/NoAcademyState';
import { formatNumber } from '@/components/course/courseUtils';
import { CourseEnrollmentsCard } from '@/components/course/detail/course-enrollments-card';
import { CourseFactsCard } from '@/components/course/detail/course-facts-card';
import { CourseMoneyBand } from '@/components/course/detail/course-money-band';
import { StatTile } from '@/components/course/detail/stat-tile';
import { TeacherShareNote } from '@/components/shared/teacher-share-note';
import { activeClassCount, seatTotals } from '@/components/course/live/live-class-stats';
import { canViewCourseMoney, countLessons } from '@/components/course/detail/types';
import { useCourseWorkspace } from '@/components/course/detail/course-workspace-context';
import { useCourseDetail } from '@/components/course/detail/use-course-detail';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';

/**
 * The course's numbers: revenue, sales, enrolments and what it charges. The
 * cover, title and description are the workspace header's job — and editing
 * them belongs to the builder — so this tab carries reports only.
 */
export default function CourseFinancePage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();
  const percentLabel = usePercentLabel();
  const { course, loading: courseLoading } = useCourseWorkspace();
  const isLive = course?.course_type === 'LIVE';
  const { payments, paymentsLoading, enrollments, live } = useCourseDetail(courseId, isLive);

  const seats = useMemo(() => seatTotals(live.groups), [live.groups]);

  if (!selectedAcademy) return <NoAcademyState />;

  if (courseLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <p className="text-muted-foreground">{t('courseDetail.notFound')}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/courses')}>
            {t('courseDetail.backToCourses')}
          </Button>
        </div>
      </div>
    );
  }

  const seasons = course.Season ?? [];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={<Users className="h-4 w-4" />}
          label={t('courseDetail.totalStudents')}
          value={formatNumber(course.active_enrollment_count ?? 0)}
          sub={t('courseDetail.allTimeEnrollments')}
          color="blue"
        />
        {isLive ? (
          <>
            <StatTile
              icon={<CalendarDays className="h-4 w-4" />}
              label={t('courseDetail.activeClasses')}
              value={live.loading ? null : formatNumber(activeClassCount(live.groups))}
              sub={t('courseDetail.activeClassesHint')}
              color="violet"
            />
            <StatTile
              icon={<Users className="h-4 w-4" />}
              label={t('courseDetail.seatsSold')}
              value={
                live.loading
                  ? null
                  : t('courseDetail.seatsOf', {
                      taken: formatNumber(seats.taken),
                      capacity: formatNumber(seats.capacity),
                    })
              }
              sub={t('courseDetail.seatsSoldHint')}
              color="emerald"
            />
            <StatTile
              icon={<Percent className="h-4 w-4" />}
              label={t('courseDetail.seatFill')}
              value={
                live.loading
                  ? null
                  : seats.fillPercent === null
                    ? '—'
                    : percentLabel(seats.fillPercent)
              }
              sub={t('courseDetail.seatFillHint')}
              color="amber"
            />
          </>
        ) : (
          <StatTile
            icon={<BookOpen className="h-4 w-4" />}
            label={t('courseDetail.lessons')}
            value={formatNumber(countLessons(seasons))}
            sub={t('courseDetail.sections', {
              count: formatNumber(seasons.length),
            })}
            color="violet"
          />
        )}
      </div>

      {canViewCourseMoney(course) && (
        <div className="space-y-2">
          <TeacherShareNote />
          <CourseMoneyBand payments={payments} loading={paymentsLoading} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CourseEnrollmentsCard enrollments={enrollments} />
        </div>
        <CourseFactsCard course={course} offers={live.offers} />
      </div>
    </div>
  );
}
