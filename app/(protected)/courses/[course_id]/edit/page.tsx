'use client';

import { useParams } from 'next/navigation';
import CourseWizard from '@/components/course/wizard/course-wizard';

/**
 * Editing a course is the same step-by-step builder as creating one, only with
 * the fields already filled in. A live course runs the same steps without the
 * lesson tree.
 */
export default function EditCoursePage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();

  return <CourseWizard courseId={courseId} />;
}
