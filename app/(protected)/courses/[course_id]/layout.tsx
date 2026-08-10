'use client';

import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { CourseWorkspaceHeader } from '@/components/course/detail/course-workspace-header';
import { CourseWorkspaceProvider } from '@/components/course/detail/course-workspace-context';

export default function CourseWorkspaceLayout({
  children
}: {
  children: ReactNode;
}) {
  const { course_id: courseId } = useParams<{ course_id: string }>();

  return (
    <CourseWorkspaceProvider courseId={courseId}>
      <div className="flex min-h-full flex-1 flex-col">
        <CourseWorkspaceHeader />
        {children}
      </div>
    </CourseWorkspaceProvider>
  );
}
