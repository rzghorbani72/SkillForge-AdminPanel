'use client';

import { useParams } from 'next/navigation';
import { useCourseWorkspace } from '@/components/course/detail/course-workspace-context';
import { ClassRequestsCard } from './_components/class-requests-card';
import { CourseQuestionsCard } from './_components/course-questions-card';

/** One inbox for what visitors ask on the course page: questions and class times. */
export default function CourseRequestsPage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  const { course } = useCourseWorkspace();

  return (
    <div className="space-y-6 p-4">
      {course?.course_type === 'LIVE' ? <ClassRequestsCard courseId={courseId} /> : null}
      <CourseQuestionsCard courseId={courseId} />
    </div>
  );
}
