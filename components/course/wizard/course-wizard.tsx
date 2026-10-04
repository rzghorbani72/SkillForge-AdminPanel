'use client';

import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useTranslation } from '@/lib/i18n/hooks';
import NoAcademyState from '../NoAcademyState';
import { LiveStepLayout } from './live/live-step-layout';
import { WizardHeader } from './wizard-header';
import { WizardNav } from './wizard-nav';
import { WizardStepBody } from './wizard-step-body';
import { WIZARD_STEP_HINT, WIZARD_STEP_LABEL } from './wizard-steps';
import { useCourseWizard } from './use-course-wizard';

/**
 * Builds one course in steps. Each step autosaves, so stepping back and forth
 * never loses work; publishing happens only on the final step. A live course
 * swaps content/access/pricing for schedule, class type, class access and review.
 */
export default function CourseWizard({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const wizard = useCourseWizard(courseId);
  const { course, steps, step, index, isLast, isPublic } = wizard;
  const liveReview = step === 'review';
  const nextStep = steps.at(index + 1);

  if (!course.selectedAcademy) return <NoAcademyState />;
  if (course.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const saveAndExit = async () => {
    if (await wizard.saveStep()) router.push('/courses');
  };

  const body = (
    <WizardStepBody
      step={step}
      courseId={courseId}
      course={course}
      isPublic={isPublic}
      accessVersion={wizard.accessVersion}
      onVisibilityChange={wizard.setVisibility}
      onPendingAccessChange={wizard.setPendingAccess}
      live={wizard.live}
      publisher={wizard.publisher}
      onGoTo={wizard.goTo}
    />
  );

  return (
    <>
      <WizardHeader
        step={step}
        steps={steps}
        onSelectStep={wizard.goTo}
        saveStatus={course.saveStatus}
        onSave={liveReview ? undefined : wizard.saveStep}
        onRetrySave={course.retrySave}
      />
      <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">
        <p className="mb-6 text-sm text-muted-foreground">{t(WIZARD_STEP_HINT[step])}</p>
        <Form {...course.form}>
          <form onSubmit={(e) => e.preventDefault()} noValidate>
            {wizard.isLive ? (
              <LiveStepLayout
                step={step}
                live={wizard.live}
                publisher={wizard.publisher}
                title={course.form.watch('title')}
                isPublished={Boolean(course.form.watch('published'))}
              >
                {body}
              </LiveStepLayout>
            ) : (
              body
            )}
            <WizardNav
              index={index}
              isLast={isLast}
              isSaving={course.isSaving}
              nextLabel={nextStep ? t(WIZARD_STEP_LABEL[nextStep]) : undefined}
              showFinish={!liveReview}
              onBack={() => wizard.goTo(steps[index - 1])}
              onSaveAndExit={() => void saveAndExit()}
              onNext={() => void wizard.goNext()}
              onFinish={() => void wizard.finish()}
            />
          </form>
        </Form>
      </div>
    </>
  );
}
