'use client';

import { useParams } from 'next/navigation';
import { useCourseView } from '@/components/course/useCourseView';
import CourseHeader from '@/components/course/CourseHeader';
import CourseCover from '@/components/course/CourseCover';
import CourseInfo from '@/components/course/CourseInfo';
import CoursePricing from '@/components/course/CoursePricing';
import CourseAssociations from '@/components/course/CourseAssociations';
import CoursePublishSettings from '@/components/course/CoursePublishSettings';
import CourseManagement from '@/components/course/CourseManagement';
import LoadingState from '@/components/course/LoadingState';
import ErrorState from '@/components/course/ErrorState';
import NoSchoolState from '@/components/course/NoSchoolState';
// import AccessControlGuard from '@/components/access-control/AccessControlGuard';

export default function CourseViewPage() {
  const params = useParams();
  const courseId = params.course_id as string;

  const {
    course,
    isLoading,
    isDeleting,
    selectedSchool,
    handleEditCourse,
    handleManageSeasons,
    handleDeleteCourse,
    handleBack
  } = useCourseView(courseId);

  if (!selectedSchool) {
    return <NoSchoolState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!course) {
    return <ErrorState onBack={handleBack} />;
  }

  return (
    // <AccessControlGuard
    //   resource={course}
    //   action="view"
    //   fallbackPath="/courses"
    //   fallbackMessage="You do not have permission to view this course."
    // >
    <div className="flex-1 space-y-6 p-6">
      <CourseHeader
        course={course}
        isDeleting={isDeleting}
        onBack={handleBack}
        onEdit={handleEditCourse}
        onManageSeasons={handleManageSeasons}
        onDelete={handleDeleteCourse}
      />

      <CourseCover course={course} />

      <CourseInfo course={course} />

      <CoursePricing course={course} />

      <CourseAssociations course={course} />

      <CoursePublishSettings course={course} />

      <CourseManagement
        course={course}
        onManageSeasons={handleManageSeasons}
        onEdit={handleEditCourse}
      />
    </div>
    // </AccessControlGuard>
  );
}
