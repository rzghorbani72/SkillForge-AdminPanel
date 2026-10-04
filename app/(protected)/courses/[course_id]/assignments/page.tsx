'use client';

import { useParams } from 'next/navigation';
import { AssignmentsView } from '@/app/(protected)/assignments/_components/assignments-view';

export default function CourseAssignmentsPage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  return <AssignmentsView lockedCourseId={courseId} />;
}
