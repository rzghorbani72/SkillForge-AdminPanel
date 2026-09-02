'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, CalendarDays, Percent, Users } from 'lucide-react';
import { CourseAccessSection } from '@/components/access/course-access-section';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NoAcademyState from '@/components/course/NoAcademyState';
import { formatNumber } from '@/components/course/courseUtils';
import { CourseCurriculumPreview } from '@/components/course/detail/course-curriculum-preview';
import { CourseLiveClassroom } from '@/components/course/detail/course-live-classroom';
import { CourseEnrollmentsCard } from '@/components/course/detail/course-enrollments-card';
import { CourseFactsCard } from '@/components/course/detail/course-facts-card';
import { CourseHero } from '@/components/course/detail/course-hero';
import { CourseMoneyBand } from '@/components/course/detail/course-money-band';
import { StatTile } from '@/components/course/detail/stat-tile';
import {
  activeClassCount,
  seatTotals
} from '@/components/course/live/live-class-stats';
import { liveSetupSteps } from '@/components/course/live/live-setup-steps';
import {
  canViewCourseMoney,
  countLessons
} from '@/components/course/detail/types';
import { useCourseWorkspace } from '@/components/course/detail/course-workspace-context';
import { useCourseDetail } from '@/components/course/detail/use-course-detail';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';

export default function CourseDetailPage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();
  const percentLabel = usePercentLabel();
  const { course, loading: courseLoading } = useCourseWorkspace();
  const isLive = course?.course_type === 'LIVE';
  const { payments, paymentsLoading, enrollments, live } = useCourseDetail(
    courseId,
    isLive
  );

  const steps = useMemo(
    () =>
      liveSetupSteps({
        topics: live.topics.length,
        classes: live.groups.length,
        classesWithSchedule: live.groups.filter((group) => group.Slots?.length)
          .length,
        sellingOffers: live.offers.filter((offer) => offer.is_active !== false)
          .length
      }),
    [live]
  );
  const seats = useMemo(() => seatTotals(live.groups), [live.groups]);

  if (!selectedAcademy) return <NoAcademyState />;

  if (courseLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
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
  const showMoney = canViewCourseMoney(course);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      {/* A live course is run, not browsed: the timetable comes first and the
          public description sits at the bottom as a proof-read. */}
      {isLive ? (
        <CourseLiveClassroom
          courseId={courseId}
          groups={live.groups}
          steps={steps}
          loading={live.loading}
          leftoverLessons={countLessons(course.Season ?? [])}
        />
      ) : (
        <CourseHero course={course} />
      )}

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
              value={
                live.loading
                  ? null
                  : formatNumber(activeClassCount(live.groups))
              }
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
                      capacity: formatNumber(seats.capacity)
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
              count: formatNumber(seasons.length)
            })}
            color="violet"
          />
        )}
      </div>

      {showMoney && (
        <CourseMoneyBand payments={payments} loading={paymentsLoading} />
      )}

      {!isLive && (
        <CourseCurriculumPreview
          seasons={seasons}
          onManage={() => router.push(`/courses/${courseId}/seasons`)}
        />
      )}

      <CourseAccessSection courseId={courseId} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CourseEnrollmentsCard enrollments={enrollments} />
        </div>
        <CourseFactsCard course={course} offers={live.offers} />
      </div>

      {isLive && <CourseHero course={course} />}
    </div>
  );
}
