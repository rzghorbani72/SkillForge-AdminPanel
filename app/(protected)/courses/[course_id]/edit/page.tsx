'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import CourseFormPage from '@/components/course/CourseFormPage';
import CourseWizard from '@/components/course/wizard/course-wizard';
import { useCourseWorkspace } from '@/components/course/detail/course-workspace-context';

/**
 * A recorded course is built step by step; a live course is run from its
 * timetable, so it keeps the single-page form.
 */
export default function EditCoursePage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  const { course, loading } = useCourseWorkspace();

  if (loading && !course) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return course?.course_type === 'LIVE' ? (
    <CourseFormPage courseId={courseId} />
  ) : (
    <CourseWizard courseId={courseId} />
  );
}
