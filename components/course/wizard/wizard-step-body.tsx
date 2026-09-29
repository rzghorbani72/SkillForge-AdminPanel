'use client';

import type { AssignAccessSelection } from '@/components/access/assign-access-form';
import { CoursePricingSection } from '../pricing/course-pricing-section';
import { useCourseForm } from '../useCourseForm';
import { StepAccess } from './step-access';
import { StepBasics } from './step-basics';
import { StepClasses } from './step-classes';
import { StepClassroom } from './step-classroom';
import { StepContent } from './step-content';
import { StepPreview } from './step-preview';
import type { CourseWizardStep } from './wizard-steps';

type WizardStepBodyProps = {
  step: CourseWizardStep;
  courseId: string;
  course: ReturnType<typeof useCourseForm>;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  onPendingAccessChange: (selection: AssignAccessSelection | null) => void;
};

export function WizardStepBody({
  step,
  courseId,
  course,
  isPublic,
  onVisibilityChange,
  onPendingAccessChange,
}: WizardStepBodyProps) {
  const { form } = course;

  return (
    <>
      {step === 'basics' && (
        <StepBasics
          form={form}
          courseType={course.courseType}
          coverPreviewUrl={course.coverPreviewUrl}
          onCoverChange={course.handleCoverImageChange}
        />
      )}
      {step === 'content' && <StepContent curriculum={course} />}
      {step === 'classroom' && <StepClassroom courseId={courseId} />}
      {step === 'classes' && <StepClasses courseId={courseId} />}
      {step === 'access' && (
        <StepAccess
          courseId={courseId}
          form={form}
          isPublic={isPublic}
          onVisibilityChange={onVisibilityChange}
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
