'use client';

import type { ReactNode } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { CourseWorkspaceHeader } from '@/components/course/detail/course-workspace-header';
import { CourseWorkspaceProvider } from '@/components/course/detail/course-workspace-context';

export default function CourseWorkspaceLayout({
  children
}: {
  children: ReactNode;
}) {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  // The builder pins its own step bar to the top: only one of the two bars may
  // be sticky or they stack and eat the screen, and the steps replace the tabs.
  const isBuilder = usePathname().endsWith('/edit');

  return (
    <CourseWorkspaceProvider courseId={courseId}>
      <div className="flex min-h-full flex-1 flex-col">
        <CourseWorkspaceHeader sticky={!isBuilder} showTabs={!isBuilder} />
        {children}
      </div>
    </CourseWorkspaceProvider>
  );
}
