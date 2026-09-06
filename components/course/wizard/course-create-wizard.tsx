'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import NoAcademyState from '../NoAcademyState';
import { courseFormSchema, type CourseFormData } from '../schema';
import type { CourseType } from '../course-drafts';
import { StepBasics } from './step-basics';
import { WizardHeader } from './wizard-header';
import { stepsFor, type CourseWizardStep } from './wizard-steps';

function newCourseId(response: unknown): string | undefined {
  const body = response as { data?: { data?: { id?: string }; id?: string } };
  return body?.data?.data?.id ?? body?.data?.id;
}

/**
 * Step 1 of the same wizard, before the course exists. Content, access and
 * pricing all need a saved course to attach to, so this step creates the draft
 * row and hands over to the builder at step 2 — one continuous flow.
 */
export default function CourseCreateWizard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedAcademy } = useStore();

  const [courseType, setCourseType] = useState<CourseType>('OFFLINE');
  // Switching the type reshapes the wizard: a live course has no lesson tree,
  // so its `content` step disappears from the stepper as soon as it is picked.
  const steps = stepsFor(courseType);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      primary_price: '0',
      secondary_price: '',
      meta_title: '',
      meta_description: '',
      keywords: [],
      category_id: '',
      cover_id: '',
      published: false,
      is_featured: false,
      base_price_active: true,
      allow_downloads: false,
      apply_downloads_to_lessons: false
    }
  });

  /**
   * Every step is clickable here too, so the draft is created on the way to
   * whichever step was asked for — the manager lands in the same builder they
   * would reach with Next, already filled in.
   */
  const createAndContinue = async (step: CourseWizardStep) => {
    if (!(await form.trigger(['title', 'description']))) {
      toast.error(t('courses.fixErrorsBeforeSaving'));
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    const values = form.getValues();
    try {
      const response = await apiClient.createCourse({
        title: values.title.trim(),
        description: values.description.trim(),
        course_type: courseType,
        cover_id: values.cover_id || undefined,
        primary_price: 0,
        secondary_price: 0,
        published: false
      });
      const id = newCourseId(response);
      if (!id) throw new Error('Course creation returned no id');

      toast.success(t('courses.createdDraftToast'));
      router.push(`/courses/${id}/edit?step=${step}`);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setIsSaving(false);
    }
  };

  if (!selectedAcademy) return <NoAcademyState />;

  return (
    <>
      <WizardHeader
        title={t('courses.createCourse')}
        subtitle={selectedAcademy.name}
        courseType={courseType}
        step="basics"
        steps={steps}
        onSelectStep={(step) => {
          if (step !== 'basics') void createAndContinue(step);
        }}
        onBack={() => router.push('/courses')}
      />

      <div className="mx-auto w-full max-w-[1200px] p-4 sm:p-6">
        <p className="mb-6 text-sm text-muted-foreground">
          {t('courses.wizard.stepBasicsHint')}
        </p>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <StepBasics
              form={form}
              courseType={courseType}
              onCourseTypeChange={setCourseType}
              coverPreviewUrl={coverUrl}
              onCoverChange={(image) => {
                form.setValue('cover_id', image.id, { shouldDirty: true });
                setCoverUrl(image.url || null);
              }}
            />

            <div className="mt-6 flex items-center justify-end gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/courses')}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={() => void createAndContinue(steps[1])}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('courses.creatingCourse')}
                  </>
                ) : (
                  <>
                    {t('common.next')}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
