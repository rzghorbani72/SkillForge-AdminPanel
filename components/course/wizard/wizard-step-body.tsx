'use client';

import { ListOrdered, Loader2 } from 'lucide-react';
import type { AssignAccessSelection } from '@/components/access/assign-access-form';
import { useTranslation } from '@/lib/i18n/hooks';
import TopicListEditor from '@/app/(protected)/courses/[course_id]/live/_components/topic-list-editor';
import { DIFFICULTY_LABEL } from '../CourseFactsCard';
import { CoursePricingSection } from '../pricing/course-pricing-section';
import { useCourseForm } from '../useCourseForm';
import { StepAccess } from './step-access';
import { StepBasics } from './step-basics';
import { StepContent } from './step-content';
import { StepPreview } from './step-preview';
import { StepClassMembers } from './live/step-class-members';
import { StepClassType } from './live/step-class-type';
import { StepMeeting } from './live/step-meeting';
import { SectionCard } from '@/components/shared/section-card';
import { StepReview } from './live/step-review';
import { StepSchedule } from './live/step-schedule';
import type { LiveClassDraftApi } from './live/use-live-class-draft';
import type { LivePublishApi } from './live/use-live-publish';
import { isLiveClassStep, type CourseWizardStep } from './wizard-steps';

type WizardStepBodyProps = {
  step: CourseWizardStep;
  courseId: string;
  course: ReturnType<typeof useCourseForm>;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  accessVersion: number;
  pendingAccess: AssignAccessSelection | null;
  onPendingAccessChange: (selection: AssignAccessSelection | null) => void;
  live: LiveClassDraftApi;
  publisher: LivePublishApi;
  onGoTo: (step: CourseWizardStep) => void;
};

function LiveLoading() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function WizardStepBody({
  step,
  courseId,
  course,
  isPublic,
  onVisibilityChange,
  accessVersion,
  pendingAccess,
  onPendingAccessChange,
  live,
  publisher,
  onGoTo,
}: WizardStepBodyProps) {
  const { t } = useTranslation();
  const { form } = course;
  const isLive = course.courseType === 'LIVE';
  const liveStep = isLiveClassStep(step) || step === 'review' || (isLive && step === 'access');

  if (liveStep && live.isLoading) return <LiveLoading />;

  return (
    <>
      {step === 'basics' && (
        <div className="flex flex-col gap-4">
          <StepBasics
            form={form}
            coverPreviewUrl={course.coverPreviewUrl}
            onCoverChange={course.handleCoverImageChange}
          />
          {isLive && !live.isLoading ? (
            <SectionCard
              icon={ListOrdered}
              title={t('courses.live.topics')}
              hint={t('liveWizard.topicsCardHint')}
            >
              <TopicListEditor
                bare
                courseId={courseId}
                initial={live.topics}
                onSaved={(topics) => live.patchTopics({ topics })}
              />
            </SectionCard>
          ) : null}
        </div>
      )}
      {step === 'content' && <StepContent curriculum={course} />}
      {step === 'schedule' && <StepSchedule live={live} />}
      {step === 'classType' && <StepClassType live={live} />}
      {step === 'meeting' && <StepMeeting live={live} />}
      {step === 'review' && (
        <StepReview
          live={live}
          publisher={publisher}
          title={form.getValues('title')}
          description={form.getValues('description')}
          coverUrl={course.coverPreviewUrl}
          levelKey={DIFFICULTY_LABEL[form.getValues('difficulty')]}
          onEdit={onGoTo}
        />
      )}
      {step === 'access' && isLive && <StepClassMembers group={live.group} />}
      {step === 'access' && !isLive && (
        <StepAccess
          courseId={courseId}
          isPublic={isPublic}
          onVisibilityChange={onVisibilityChange}
          accessVersion={accessVersion}
          pendingAccess={pendingAccess}
          onPendingAccessChange={onPendingAccessChange}
        />
      )}
      {step === 'pricing' && <CoursePricingSection courseId={courseId} form={form} />}
      {step === 'preview' && (
        <StepPreview
          values={{ ...form.getValues(), published: isPublic }}
          seasons={course.seasons}
          lessons={course.lessons}
          coverPreviewUrl={course.coverPreviewUrl}
          courseType={course.courseType}
        />
      )}
    </>
  );
}
