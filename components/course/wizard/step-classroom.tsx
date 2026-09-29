'use client';

import { Loader2 } from 'lucide-react';
import TopicListEditor from '@/app/(protected)/courses/[course_id]/live/_components/topic-list-editor';
import LivePricingCard from '@/app/(protected)/courses/[course_id]/live/_components/live-pricing-card';
import { useLiveCourse } from '@/app/(protected)/courses/[course_id]/live/hooks/use-live-course';
import { offersKey } from '@/app/(protected)/courses/[course_id]/live/hooks/use-schedule-builder';

/**
 * A live course has no lesson tree — this step replaces `content` for it:
 * what the course covers and its default seat price. Classes are the next step.
 */
export function StepClassroom({ courseId }: { courseId: string }) {
  const { course, topics, offers, isLoading, reload, patch } = useLiveCourse(courseId);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TopicListEditor
        courseId={courseId}
        initial={topics}
        onSaved={(saved) => patch({ topics: saved })}
      />
      <LivePricingCard
        key={offersKey(offers)}
        courseId={courseId}
        courseTitle={course.title}
        tutorProfileId={String(course.author_id)}
        offers={offers}
        onSaved={() => void reload()}
      />
    </div>
  );
}
