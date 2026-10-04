import { Suspense } from 'react';
import CourseCreateWizard from '@/components/course/wizard/course-create-wizard';

export default function CreateCoursePage() {
  return (
    <Suspense>
      <CourseCreateWizard />
    </Suspense>
  );
}
