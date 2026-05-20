'use client';

import { useParams } from 'next/navigation';
import { useCourseView } from '@/components/course/useCourseView';
import CourseEditTabs from '@/components/course/CourseEditTabs';
import LoadingState from '@/components/course/LoadingState';
import ErrorState from '@/components/course/ErrorState';
import NoStoreState from '@/components/course/NoStoreState';

export default function CourseViewPage() {
  const params = useParams();
  const courseId = params.course_id as string;

  const {
    course,
    isLoading,
    selectedAcademy,
    handleEditCourse,
    handleManageSeasons,
    handleBack
  } = useCourseView(courseId);

  if (!selectedAcademy) {
    return <NoStoreState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!course) {
    return <ErrorState onBack={handleBack} />;
  }

  return (
    <CourseEditTabs
      course={course}
      onManageSeasons={handleManageSeasons}
      onEdit={handleEditCourse}
      onBack={handleBack}
    />
  );
}
