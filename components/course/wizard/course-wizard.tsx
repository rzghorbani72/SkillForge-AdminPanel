'use client';

import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useTranslation } from '@/lib/i18n/hooks';
import NoAcademyState from '../NoAcademyState';
import { PublishFooterActions } from './live/publish-actions';
import { WizardHeader } from './wizard-header';
import { WizardNav } from './wizard-nav';
import { WizardStepBody } from './wizard-step-body';
import { LIVE_CLASS_STEPS, WIZARD_STEP_HINT } from './wizard-steps';
import { useCourseWizard } from './use-course-wizard';

/**
 * Builds one course in steps. Next saves the step before moving on, so stepping
 * back and forth never loses work; publishing happens only on the final step. A live course
 * swaps content/access/pricing for schedule, class type, class access and review.
 */
export default function CourseWizard({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const wizard = useCourseWizard(courseId);
  const { course, steps, step, index, isLast, isPublic } = wizard;
  const liveReview = step === 'review';
  const { live, publisher } = wizard;
  const invalidSteps = wizard.isLive
    ? LIVE_CLASS_STEPS.filter((liveStep) => live.stepHasErrors(liveStep) && live.errorsShown)
    : [];

  if (!course.selectedAcademy) return <NoAcademyState />;
  if (course.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <WizardHeader
        step={step}
        steps={steps}
        invalidSteps={invalidSteps}
        onSelectStep={wizard.goTo}
        saveStatus={course.saveStatus}
        onSave={liveReview ? undefined : wizard.saveStep}
        onRetrySave={course.retrySave}
      />
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col p-4 sm:p-6">
        {wizard.isLive ? null : (
          <p className="mb-6 text-sm text-muted-foreground">{t(WIZARD_STEP_HINT[step])}</p>
        )}
        <Form {...course.form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            noValidate
            className="flex flex-1 flex-col gap-6"
          >
            <WizardStepBody
              step={step}
              courseId={courseId}
              course={course}
              isPublic={isPublic}
              accessVersion={wizard.accessVersion}
              onVisibilityChange={wizard.setVisibility}
              pendingAccess={wizard.pendingAccess}
              onPendingAccessChange={wizard.setPendingAccess}
              live={live}
              publisher={publisher}
              onGoTo={wizard.goTo}
            />
            {liveReview && publisher.justPublished ? null : (
              <WizardNav
                index={index}
                isLast={isLast}
                isSaving={course.isSaving}
                nextBusy={wizard.isAdvancing}
                finishActions={
                  liveReview ? (
                    <PublishFooterActions
                      live={live}
                      publisher={publisher}
                      isPublished={wizard.isPublished}
                    />
                  ) : undefined
                }
                offerPublish={!wizard.isPublished}
                onBack={() => wizard.goTo(steps[index - 1])}
                onNext={() => void wizard.goNext()}
                onFinish={(publish) => void wizard.finish(publish)}
              />
            )}
          </form>
        </Form>
      </div>
    </>
  );
}
