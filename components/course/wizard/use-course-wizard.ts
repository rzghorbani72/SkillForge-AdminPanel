'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { applyAccessSelection } from '@/components/access/staged-access-section';
import type { AssignAccessSelection } from '@/components/access/assign-access-form';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCourseForm } from '../useCourseForm';
import {
  WIZARD_STEP_FIELDS,
  isLiveClassStep,
  stepFromParam,
  stepsFor,
  type CourseWizardStep,
} from './wizard-steps';
import { useLiveClassDraft } from './live/use-live-class-draft';
import { useLivePublish } from './live/use-live-publish';

export function useCourseWizard(courseId: string) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const course = useCourseForm(courseId);
  const steps = stepsFor(course.courseType);
  const isLive = course.courseType === 'LIVE';
  const live = useLiveClassDraft(courseId, isLive && !course.isLoading);
  const [requestedStep, setStep] = useState<CourseWizardStep>(() =>
    stepFromParam(searchParams.get('step')),
  );
  const step = steps.includes(requestedStep) ? requestedStep : 'basics';
  const [pendingAccess, setPendingAccess] = useState<AssignAccessSelection | null>(null);
  const [accessVersion, setAccessVersion] = useState(0);
  const [visibility, setVisibility] = useState<boolean | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  // The form's flag changes only on save, so it is the published state students see.
  const isPublished = Boolean(course.form.watch('published'));
  const isPublic = visibility ?? isPublished;
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

  const saveCourse = (publish: boolean = isPublic) =>
    persistWizardStep(courseId, course, publish, pendingAccess, () => {
      setPendingAccess(null);
      setAccessVersion((version) => version + 1);
    });

  // An unfinished class stays on this device until the step that completes it.
  const saveStep = async () => {
    if (!(await saveCourse())) return false;
    if (!isLive || !isLiveClassStep(step)) return true;
    if (live.isComplete) return (await live.save()) !== null;
    toast.info(t('liveWizard.keptOnDevice'));
    return true;
  };

  const goNext = async () => {
    if (isAdvancing) return;
    if (isLiveClassStep(step) && live.stepHasErrors(step)) {
      live.revealErrors();
      toast.error(t('courses.fixErrorsBeforeSaving'));
      return;
    }
    const fields = WIZARD_STEP_FIELDS[step];
    if (fields.length > 0 && !(await course.form.trigger(fields))) {
      toast.error(t('courses.fixErrorsBeforeSaving'));
      return;
    }
    setIsAdvancing(true);
    try {
      if (await saveStep()) goTo(steps[index + 1]);
    } finally {
      setIsAdvancing(false);
    }
  };

  const publisher = useLivePublish(live, course, saveCourse);

  // Only a recorded course ends here; a live one publishes from its review step.
  const finish = async (publish: boolean = isPublic) => {
    if (!(await saveCourse(publish))) return;
    if (publish && !isPublished) toast.success(t('courseDetail.publishedToast'));
    router.push(`/courses/${courseId}`);
  };

  return {
    course,
    live,
    publisher,
    isLive,
    steps,
    step,
    index,
    isLast: index === steps.length - 1,
    isPublic,
    isPublished,
    isAdvancing,
    accessVersion,
    goTo,
    goNext,
    saveStep,
    finish,
    setVisibility,
    pendingAccess,
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
  // A live course is published only by the review step, after its class exists.
  const publishOnSave = course.courseType === 'LIVE' ? previous : isPublic;
  course.form.setValue('published', publishOnSave);
  if (!(await course.saveNow({ silentSuccess: true }))) {
    course.form.setValue('published', previous);
    return false;
  }
  if (pendingAccess) {
    if (await applyAccessSelection(courseId, pendingAccess)) clearPending();
  }
  return true;
}
