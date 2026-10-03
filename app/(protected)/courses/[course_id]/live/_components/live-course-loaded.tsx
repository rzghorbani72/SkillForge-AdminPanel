'use client';

import { Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LiveSetupChecklist } from '@/components/course/live/live-setup-checklist';
import type { LiveSetupStep } from '@/components/course/live/live-setup-steps';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Course } from '@/types/api';
import type { CourseTopic, TutoringGroup, TutoringOffer } from '@/types/learning-operations';
import TopicListEditor from './topic-list-editor';
import LivePricingCard from './live-pricing-card';
import { LiveClassesSection } from './live-classes-section';

export function LiveCourseLoaded({
  courseId,
  course,
  topics,
  offers,
  groups,
  steps,
  ready,
  isPublishing,
  onPublish,
  onReload,
  onTopicsSaved,
}: {
  courseId: string;
  course: Course;
  topics: CourseTopic[];
  offers: TutoringOffer[];
  groups: TutoringGroup[];
  steps: LiveSetupStep[];
  ready: boolean;
  isPublishing: boolean;
  onPublish: () => void;
  onReload: () => void;
  onTopicsSaved: (saved: CourseTopic[]) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <LiveSetupChecklist
        steps={steps}
        action={
          ready && !course.is_published ? (
            <Button type="button" onClick={onPublish} disabled={isPublishing}>
              <Globe className="me-1.5 h-4 w-4" />
              {isPublishing ? t('common.saving') : t('courses.publishCourse')}
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopicListEditor courseId={courseId} initial={topics} onSaved={onTopicsSaved} />
        <LivePricingCard
          courseId={courseId}
          courseTitle={course.title}
          tutorProfileId={String(course.author_id)}
          offers={offers}
          onSaved={onReload}
        />
      </div>

      <LiveClassesSection
        courseId={courseId}
        course={course}
        offers={offers}
        groups={groups}
        onReload={onReload}
      />
    </div>
  );
}
