'use client';

import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useTranslation } from '@/lib/i18n/hooks';
import NoAcademyState from '../NoAcademyState';
import { WizardHeader } from './wizard-header';
import { WizardNav } from './wizard-nav';
import { WizardStepBody } from './wizard-step-body';
import { WIZARD_STEP_HINT } from './wizard-steps';
import { useCourseWizard } from './use-course-wizard';

/**
 * Builds one course in steps: what it is, what is inside it, who may open it,
 * what it costs, and a last look at the student's view before the whole thing
 * is saved. Each step autosaves as it is edited, so stepping back and forth
 * never loses work; publishing happens only on the final save. A live course
 * runs the same steps without `content` — its classes live in the classroom.
 */
export default function CourseWizard({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const wizard = useCourseWizard(courseId);
  const { course, steps, step, index, isLast, isPublic } = wizard;
  const autosaved = step === 'classroom';

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
        onSelectStep={wizard.goTo}
        saveStatus={course.saveStatus}
        onSave={autosaved ? undefined : wizard.saveStep}
        onRetrySave={course.retrySave}
      />
      <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">
        <p className="mb-6 text-sm text-muted-foreground">{t(WIZARD_STEP_HINT[step])}</p>
        <Form {...course.form}>
          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <WizardStepBody
              step={step}
              courseId={courseId}
              course={course}
              isPublic={isPublic}
              onVisibilityChange={wizard.setVisibility}
              onPendingAccessChange={wizard.setPendingAccess}
            />
            <WizardNav
              index={index}
              isLast={isLast}
              isSaving={course.isSaving}
              showSave={!autosaved}
              onBack={() => wizard.goTo(steps[index - 1])}
              onSave={() => void wizard.saveStep()}
              onNext={() => void wizard.goNext()}
              onFinish={() => void wizard.finish()}
            />
          </form>
        </Form>
      </div>
    </>
  );
}
