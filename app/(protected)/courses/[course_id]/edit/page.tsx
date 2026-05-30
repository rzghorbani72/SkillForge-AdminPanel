'use client';

import { useParams } from 'next/navigation';
import CourseFormPage from '@/components/course/CourseFormPage';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.course_id as string;
  return <CourseFormPage courseId={courseId} />;
}
