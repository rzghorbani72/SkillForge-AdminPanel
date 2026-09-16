'use client';

import { Loader2 } from 'lucide-react';
import TopicListEditor from '@/app/(protected)/courses/[course_id]/live/_components/topic-list-editor';
import LivePricingCard from '@/app/(protected)/courses/[course_id]/live/_components/live-pricing-card';
import { CreateClassSheet } from '@/app/(protected)/courses/[course_id]/live/_components/create-class-sheet';
import { ClassListCard } from '@/app/(protected)/courses/[course_id]/live/_components/class-list-card';
import { ClassRequestsCard } from '@/app/(protected)/courses/[course_id]/live/_components/class-requests-card';
import { useLiveCourse } from '@/app/(protected)/courses/[course_id]/live/hooks/use-live-course';

/**
 * A live course has no lesson tree — this step replaces `content` for it.
 * Everything a live class needs (what it covers, what it costs, when it
 * meets) lives here, flat, so a manager never has to leave the builder to
 * run their class.
 */
export function StepClassroom({ courseId }: { courseId: string }) {
  const { course, topics, offers, groups, isLoading, reload, patch } = useLiveCourse(courseId);

  const groupOffer = offers.find((offer) => offer.kind === 'GROUP');

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <TopicListEditor
          courseId={courseId}
          initial={topics}
          onSaved={(saved) => patch({ topics: saved })}
        />

        <LivePricingCard
          courseId={courseId}
          courseTitle={course.title}
          tutorProfileId={String(course.author_id)}
          offers={offers}
          onSaved={() => void reload()}
        />
      </div>

      <ClassRequestsCard
        courseId={courseId}
        courseTitle={course.title}
        offerId={groupOffer?.id ?? null}
        defaultSeatPrice={groupOffer?.price}
        onClassCreated={() => void reload()}
      />

      <ClassListCard
        courseId={courseId}
        coursePublished={Boolean(course.is_published)}
        groups={groups}
        onChanged={() => void reload()}
        action={
          groupOffer ? (
            <CreateClassSheet
              offerId={groupOffer.id}
              courseTitle={course.title}
              defaultSeatPrice={groupOffer.price}
              onCreated={() => void reload()}
            />
          ) : null
        }
        emptyAction={
          groupOffer ? (
            <CreateClassSheet
              offerId={groupOffer.id}
              courseTitle={course.title}
              defaultSeatPrice={groupOffer.price}
              onCreated={() => void reload()}
              variant="cta"
            />
          ) : null
        }
      />
    </div>
  );
}
