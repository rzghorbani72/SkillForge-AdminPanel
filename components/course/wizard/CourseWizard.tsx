'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { wizardSchema, WizardValues } from './wizard-schema';
import { useTranslation } from '@/lib/i18n/hooks';
import WizardStepDetails from './WizardStepDetails';
import WizardStepPricing from './WizardStepPricing';
import WizardStepAccess from './WizardStepAccess';
import WizardStepReview from './WizardStepReview';

const STEP_FIELDS: Record<number, (keyof WizardValues)[]> = {
  1: ['title', 'description'],
  2: ['pricing_type'],
  3: [],
  4: []
};

export default function CourseWizard() {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [existingCourses, setExistingCourses] = useState<
    { id: number; title: string }[]
  >([]);

  const STEP_LABELS = [
    {
      step: 1,
      title: t('wizard.step1Title'),
      description: t('wizard.step1Desc')
    },
    {
      step: 2,
      title: t('wizard.step2Title'),
      description: t('wizard.step2Desc')
    },
    {
      step: 3,
      title: t('wizard.step3Title'),
      description: t('wizard.step3Desc')
    },
    {
      step: 4,
      title: t('wizard.step4Title'),
      description: t('wizard.step4Desc')
    }
  ];

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      category_id: undefined,
      cover_id: undefined,
      pricing_type: 'FREE',
      price: undefined,
      access_duration_days: null,
      installment_count: undefined,
      amount_per_installment: undefined,
      interval_days: undefined,
      prerequisite_course_id: null,
      is_published: false,
      is_featured: false
    }
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, coursesResp] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getCourses({ academy_id: selectedAcademy?.id })
        ]);
        const catList =
          (cats as any)?.categories ?? (Array.isArray(cats) ? cats : []);
        setCategories(catList.map((c: any) => ({ id: c.id, name: c.name })));
        const courseList: any[] =
          coursesResp?.courses ??
          (Array.isArray(coursesResp) ? coursesResp : []);
        setExistingCourses(
          courseList.map((c: any) => ({ id: c.id, title: c.title }))
        );
      } catch {
        /* optional */
      }
    }
    loadData();
  }, [selectedAcademy]);

  async function validateAndAdvance() {
    const fields = STEP_FIELDS[step] ?? [];
    const valid = fields.length === 0 || (await form.trigger(fields));
    if (valid) setStep((s) => Math.min(s + 1, 4));
  }

  async function onSubmit(values: WizardValues) {
    if (!selectedAcademy) {
      toast.error(t('common.noStoreSelected'));
      return;
    }
    setSaving(true);
    try {
      const pricingType = values.pricing_type;
      const price = pricingType === 'FREE' ? 0 : (values.price ?? 0);

      const coursePayload: any = {
        title: values.title,
        description: values.description,
        primary_price: price,
        secondary_price: 0,
        pricing_type: pricingType,
        published: values.is_published,
        is_featured: values.is_featured,
        cover_id: values.cover_id ? Number(values.cover_id) : undefined,
        category_id: values.category_id
          ? Number(values.category_id)
          : undefined,
        access_duration_days: values.access_duration_days ?? undefined,
        prerequisite_course_id: values.prerequisite_course_id ?? undefined,
        meta_tags: []
      };

      const response = await apiClient.createCourse(coursePayload);
      const createdId =
        (response.data as any)?.id ?? (response.data as any)?.data?.id;

      if (
        pricingType === 'PAYMENT_PLAN' &&
        createdId &&
        values.installment_count &&
        values.amount_per_installment
      ) {
        try {
          await apiClient.createPaymentPlan(createdId, {
            installment_count: values.installment_count,
            amount_per_installment: values.amount_per_installment,
            interval_days: values.interval_days ?? 30
          });
        } catch {
          /* non-critical */
        }
      }

      toast.success(t('courses.createCourse') + ' ✓');
      router.push(createdId ? `/courses/${createdId}` : '/courses');
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  const values = form.watch();
  const isLastStep = step === 4;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('wizard.backToCourses')}
            </button>
            <span className="text-sm font-medium">{t('wizard.newCourse')}</span>
            <div className="w-24" />
          </div>

          {/* Step indicator */}
          <div className="mt-5 flex items-center justify-between">
            {STEP_LABELS.map((s, idx) => {
              const done = step > s.step;
              const current = step === s.step;
              return (
                <div key={s.step} className="flex flex-1 items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                        done
                          ? 'bg-primary text-primary-foreground'
                          : current
                            ? 'border-2 border-primary text-primary'
                            : 'border-2 border-muted-foreground/30 text-muted-foreground/50'
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : s.step}
                    </div>
                    <div className="hidden sm:block">
                      <p
                        className={cn(
                          'text-xs font-semibold',
                          current ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {s.title}
                      </p>
                    </div>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className={cn(
                        'mx-3 h-px flex-1',
                        done ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              {STEP_LABELS[step - 1].title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {STEP_LABELS[step - 1].description}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
              {step === 1 && (
                <WizardStepDetails form={form} categories={categories} />
              )}
              {step === 2 && <WizardStepPricing form={form} />}
              {step === 3 && (
                <WizardStepAccess form={form} courses={existingCourses} />
              )}
              {step === 4 && (
                <WizardStepReview
                  values={values}
                  categories={categories}
                  courses={existingCourses}
                />
              )}

              <div className="mt-10 flex items-center justify-between border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(s - 1, 1))}
                  disabled={step === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {t('wizard.backButton')}
                </Button>

                {isLastStep ? (
                  <Button
                    type="submit"
                    disabled={saving}
                    className="min-w-[140px]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('wizard.creating')}
                      </>
                    ) : (
                      t('wizard.createButton')
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={validateAndAdvance}
                    className="min-w-[120px]"
                  >
                    {t('wizard.continueButton')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
