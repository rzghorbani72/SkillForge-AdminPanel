'use client';

import { useParams } from 'next/navigation';
import CourseFormPage from '@/components/course/CourseFormPage';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = Number(params.course_id);
  return <CourseFormPage courseId={courseId} />;
}
