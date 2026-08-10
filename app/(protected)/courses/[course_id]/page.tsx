'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { CourseAccessSection } from '@/components/access/course-access-section';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NoAcademyState from '@/components/course/NoAcademyState';
import { formatNumber } from '@/components/course/courseUtils';
import { CourseCurriculumPreview } from '@/components/course/detail/course-curriculum-preview';
import { CourseEnrollmentsCard } from '@/components/course/detail/course-enrollments-card';
import { CourseFactsCard } from '@/components/course/detail/course-facts-card';
import { CourseHero } from '@/components/course/detail/course-hero';
import { CourseMoneyBand } from '@/components/course/detail/course-money-band';
import { StatTile } from '@/components/course/detail/stat-tile';
import {
  canViewCourseMoney,
  countLessons
} from '@/components/course/detail/types';
import { useCourseDetail } from '@/components/course/detail/use-course-detail';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';

export default function CourseDetailPage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();
  const [publishing, setPublishing] = useState(false);

  const {
    course,
    courseLoading,
    payments,
    paymentsLoading,
    enrollments,
    refreshCourse
  } = useCourseDetail(courseId);

  if (!selectedAcademy) return <NoAcademyState />;

  if (courseLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
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

  const togglePublish = async () => {
    setPublishing(true);
    try {
      await apiClient.updateCourse(course.id, {
        published: !course.is_published
      });
      await refreshCourse();
      toast.success(
        course.is_published
          ? t('courseDetail.unpublishedToast')
          : t('courseDetail.publishedToast')
      );
    } catch {
      toast.error(t('courseDetail.publishFailed'));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <CourseHero
        course={course}
        publishing={publishing}
        onBack={() => router.push('/courses')}
        onEdit={() => router.push(`/courses/${courseId}/edit`)}
        onCurriculum={() => router.push(`/courses/${courseId}/seasons`)}
        onTogglePublish={togglePublish}
      />

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <StatTile
          icon={<Users className="h-4 w-4" />}
          label={t('courseDetail.totalStudents')}
          value={formatNumber(course.active_enrollment_count ?? 0)}
          sub={t('courseDetail.allTimeEnrollments')}
          color="blue"
        />
        <StatTile
          icon={<BookOpen className="h-4 w-4" />}
          label={t('courseDetail.lessons')}
          value={formatNumber(countLessons(seasons))}
          sub={t('courseDetail.sections', {
            count: formatNumber(seasons.length)
          })}
          color="violet"
        />
      </div>

      {showMoney && (
        <CourseMoneyBand payments={payments} loading={paymentsLoading} />
      )}

      <CourseCurriculumPreview
        seasons={seasons}
        onManage={() => router.push(`/courses/${courseId}/seasons`)}
      />

      <CourseAccessSection courseId={courseId} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CourseEnrollmentsCard enrollments={enrollments} />
        </div>
        <CourseFactsCard
          course={course}
          onPaymentPlans={() => router.push(`/courses/${courseId}/plans`)}
        />
      </div>
    </div>
  );
}
