'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { applyAccessSelection } from '@/components/access/staged-access-section';
import type { AssignAccessSelection } from '@/components/access/assign-access-form';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCourseForm } from '../useCourseForm';
import { WIZARD_STEP_FIELDS, stepFromParam, stepsFor, type CourseWizardStep } from './wizard-steps';

export function useCourseWizard(courseId: string) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const course = useCourseForm(courseId);
  const steps = stepsFor(course.courseType);
  const [requestedStep, setStep] = useState<CourseWizardStep>(() =>
    stepFromParam(searchParams.get('step')),
  );
  const step = steps.includes(requestedStep) ? requestedStep : 'basics';
  const [pendingAccess, setPendingAccess] = useState<AssignAccessSelection | null>(null);
  const [visibility, setVisibility] = useState<boolean | null>(null);
  const isPublic = visibility ?? course.form.watch('published');
  const index = steps.indexOf(step);

  useEffect(() => {
    setStep(stepFromParam(searchParams.get('step')));
  }, [searchParams]);

  const goTo = (next: CourseWizardStep) => {
    setStep(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    document.getElementById('app-scroll-area')?.scrollTo({ top: 0 });
  };

  const goNext = async () => {
    const fields = WIZARD_STEP_FIELDS[step];
    if (fields.length > 0 && !(await course.form.trigger(fields))) {
      toast.error(t('courses.fixErrorsBeforeSaving'));
      return;
    }
    goTo(steps[index + 1]);
  };

  // Live courses go public only from the live setup page after the timetable is ready.
  const saveStep = () =>
    persistWizardStep(courseId, course, isPublic, pendingAccess, () => setPendingAccess(null));

  const finish = async () => {
    if (!(await saveStep())) return;
    router.push(`/courses/${courseId}`);
  };

  return {
    course,
    steps,
    step,
    index,
    isLast: index === steps.length - 1,
    isPublic,
    goTo,
    goNext,
    saveStep,
    finish,
    setVisibility,
    setPendingAccess,
  };
}

async function persistWizardStep(
  courseId: string,
  course: ReturnType<typeof useCourseForm>,
  isPublic: boolean,
  pendingAccess: AssignAccessSelection | null,
  clearPending: () => void,
): Promise<boolean> {
  const previous = course.form.getValues('published');
  const publishOnSave = course.courseType === 'LIVE' ? false : isPublic;
  course.form.setValue('published', publishOnSave);
  if (!(await course.saveNow({ silentSuccess: true }))) {
    course.form.setValue('published', previous);
    return false;
  }
  if (pendingAccess) {
    await applyAccessSelection(courseId, pendingAccess);
    clearPending();
  }
  return true;
}
