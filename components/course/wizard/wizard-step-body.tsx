'use client';

import { Loader2 } from 'lucide-react';
import type { AssignAccessSelection } from '@/components/access/assign-access-form';
import TopicListEditor from '@/app/(protected)/courses/[course_id]/live/_components/topic-list-editor';
import { CoursePricingSection } from '../pricing/course-pricing-section';
import { useCourseForm } from '../useCourseForm';
import { StepAccess } from './step-access';
import { StepBasics } from './step-basics';
import { StepContent } from './step-content';
import { StepPreview } from './step-preview';
import { StepClassType } from './live/step-class-type';
import { StepMeeting } from './live/step-meeting';
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
  onPendingAccessChange,
  live,
  publisher,
  onGoTo,
}: WizardStepBodyProps) {
  const { form } = course;
  const isLive = course.courseType === 'LIVE';
  const liveStep = isLiveClassStep(step) || step === 'review';

  if (liveStep && live.isLoading) return <LiveLoading />;

  return (
    <>
      {step === 'basics' && (
        <div className="space-y-6">
          <StepBasics
            form={form}
            courseType={course.courseType}
            coverPreviewUrl={course.coverPreviewUrl}
            onCoverChange={course.handleCoverImageChange}
          />
          {isLive && !live.isLoading ? (
            <TopicListEditor
              courseId={courseId}
              initial={live.topics}
              onSaved={(topics) => live.patchTopics({ topics })}
            />
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
          isPublished={Boolean(form.watch('published'))}
          onEdit={onGoTo}
        />
      )}
      {step === 'access' && (
        <StepAccess
          courseId={courseId}
          form={form}
          isPublic={isPublic}
          onVisibilityChange={onVisibilityChange}
          accessVersion={accessVersion}
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
