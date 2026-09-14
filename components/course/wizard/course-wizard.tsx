'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { applyAccessSelection } from '@/components/access/staged-access-section';
import type { AssignAccessSelection } from '@/components/access/assign-access-form';
import { useTranslation } from '@/lib/i18n/hooks';
import NoAcademyState from '../NoAcademyState';
import { CoursePricingSection } from '../pricing/course-pricing-section';
import { useCourseForm } from '../useCourseForm';
import { StepAccess } from './step-access';
import { StepBasics } from './step-basics';
import { StepClassroom } from './step-classroom';
import { StepContent } from './step-content';
import { StepPreview } from './step-preview';
import { WizardHeader } from './wizard-header';
import {
  WIZARD_STEP_FIELDS,
  WIZARD_STEP_HINT,
  stepFromParam,
  stepsFor,
  type CourseWizardStep,
} from './wizard-steps';

/**
 * Builds one course in steps: what it is, what is inside it, who may open it,
 * what it costs, and a last look at the student's view before the whole thing
 * is saved. Each step autosaves as it is edited, so stepping back and forth
 * never loses work; publishing happens only on the final save. A live course
 * runs the same steps without `content` — its classes live in the classroom.
 */
export default function CourseWizard({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const course = useCourseForm(courseId);
  const { form, isLoading, isSaving, saveStatus, selectedAcademy } = course;

  const steps = stepsFor(course.courseType);

  const [requestedStep, setStep] = useState<CourseWizardStep>(() =>
    stepFromParam(searchParams.get('step')),
  );
  // The course type only arrives with the course, so a step this type does not
  // have (`content` on a live course) falls back to the first one.
  const step = steps.includes(requestedStep) ? requestedStep : 'basics';
  const [pendingAccess, setPendingAccess] = useState<AssignAccessSelection | null>(null);
  // Held out of the form until the final save — see StepAccess. Untouched, it
  // follows whatever the course already is.
  const [visibility, setVisibility] = useState<boolean | null>(null);
  const isPublic = visibility ?? form.watch('published');

  const index = steps.indexOf(step);
  const isLast = index === steps.length - 1;

  // Keeps the address bar authoritative: reloading, sharing the link, or
  // using the browser's back/forward button lands on the step it names.
  useEffect(() => {
    setStep(stepFromParam(searchParams.get('step')));
  }, [searchParams]);

  const goTo = (next: CourseWizardStep) => {
    setStep(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // The page itself never scrolls — the panel body does, inside its own
    // overflow-y-auto container — so window.scrollTo has no effect here.
    document.getElementById('app-scroll-area')?.scrollTo({ top: 0 });
  };

  /** Next only moves on once the fields of the current step are valid. */
  const goNext = async () => {
    const fields = WIZARD_STEP_FIELDS[step];
    if (fields.length > 0 && !(await form.trigger(fields))) {
      toast.error(t('courses.fixErrorsBeforeSaving'));
      return;
    }
    goTo(steps[index + 1]);
  };

  /**
   * Writes the course, its visibility and any staged access grants right now —
   * used both by the header Save button and by the final Finish button, so a
   * grant made on the access step is never left waiting on a later step.
   * `silentSuccess`: the header button flashes its own "ذخیره شد", and Finish
   * navigates away immediately, so neither wants the confirmation toast too.
   */
  const saveStep = async () => {
    const previous = form.getValues('published');
    form.setValue('published', isPublic);
    if (!(await course.saveNow({ silentSuccess: true }))) {
      form.setValue('published', previous);
      return false;
    }
    if (pendingAccess) {
      await applyAccessSelection(courseId, pendingAccess);
      setPendingAccess(null);
    }
    return true;
  };

  const finish = async () => {
    if (!(await saveStep())) return;
    router.push(`/courses/${courseId}`);
  };

  if (!selectedAcademy) return <NoAcademyState />;

  if (isLoading) {
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
        onSelectStep={goTo}
        saveStatus={saveStatus}
        onSave={saveStep}
        onRetrySave={course.retrySave}
      />

      <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">
        <p className="mb-6 text-sm text-muted-foreground">{t(WIZARD_STEP_HINT[step])}</p>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} noValidate>
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

            {step === 'access' && (
              <StepAccess
                courseId={courseId}
                form={form}
                isPublic={isPublic}
                onVisibilityChange={setVisibility}
                onPendingAccessChange={setPendingAccess}
              />
            )}

            {step === 'pricing' && (
              <CoursePricingSection
                courseId={courseId}
                form={form}
                courseType={course.courseType}
              />
            )}

            {step === 'preview' && (
              <StepPreview
                values={{ ...form.getValues(), published: isPublic }}
                seasons={course.seasons}
                lessons={course.lessons}
                coverPreviewUrl={course.coverPreviewUrl}
                courseType={course.courseType}
              />
            )}

            <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                disabled={index === 0}
                onClick={() => goTo(steps[index - 1])}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {t('common.back')}
              </Button>

              <div className="flex items-center gap-3">
                {!isLast && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => void saveStep()}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t('common.save')}
                  </Button>
                )}
                {isLast ? (
                  <Button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void finish()}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t('courses.wizard.saveCourse')}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => void goNext()} className="gap-2">
                    {t('common.next')}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
