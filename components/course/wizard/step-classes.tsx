'use client';

import { Loader2 } from 'lucide-react';
import { LiveClassesSection } from '@/app/(protected)/courses/[course_id]/live/_components/live-classes-section';
import { useLiveCourse } from '@/app/(protected)/courses/[course_id]/live/hooks/use-live-course';

/** The classes of a live course: requests, the create form and the list, all in the page. */
export function StepClasses({ courseId }: { courseId: string }) {
  const { course, offers, groups, isLoading, reload } = useLiveCourse(courseId);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <LiveClassesSection
      courseId={courseId}
      course={course}
      offers={offers}
      groups={groups}
      onReload={() => void reload()}
    />
  );
}
