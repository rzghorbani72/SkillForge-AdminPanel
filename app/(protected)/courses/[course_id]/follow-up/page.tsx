'use client';

import { useParams } from 'next/navigation';
import { OpsQueueView } from '@/app/(protected)/learning/ops-queue/_components/ops-queue-view';

export default function CourseFollowUpPage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  return <OpsQueueView lockedCourseId={courseId} />;
}
