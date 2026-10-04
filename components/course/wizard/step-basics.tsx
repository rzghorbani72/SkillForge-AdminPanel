'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTranslation } from '@/lib/i18n/hooks';
import CreateCourseAssociations from '../CreateCourseAssociations';
import CourseFactsCard from '../CourseFactsCard';
import CourseSettingsCard from '../CourseSettingsCard';
import type { CourseFormData } from '../schema';
import { CourseLearningFields } from '../course-learning-fields';
import { CourseAboutCard } from './course-about-card';
import { SectionCard } from '@/components/shared/section-card';

type StepBasicsProps = {
  form: UseFormReturn<CourseFormData>;
  coverPreviewUrl: string | null;
  onCoverChange: (image: { id: string; url: string }) => void;
};

/**
 * Step 1 — what the course is. Online and offline courses share this page, so
 * nothing here may depend on there being a lesson tree or a class.
 */
export function StepBasics({ form, coverPreviewUrl, onCoverChange }: StepBasicsProps) {
  const { t } = useTranslation();

  return (
    <Collapsible className="flex flex-col gap-4">
      <CourseAboutCard form={form} coverPreviewUrl={coverPreviewUrl} onCoverChange={onCoverChange}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="group h-auto gap-1.5 self-start p-0 font-bold"
          >
            <Plus className="h-4 w-4 transition-transform group-data-[state=open]:rotate-45" />
            {t('liveWizard.moreDetails')}
          </Button>
        </CollapsibleTrigger>
      </CourseAboutCard>
      <CollapsibleContent className="grid gap-4 md:grid-cols-2">
        <SectionCard>
          <CourseLearningFields form={form} />
        </SectionCard>
        <CreateCourseAssociations
          categoryId={form.watch('category_id')}
          onCategoryChange={(id) =>
            form.setValue('category_id', id ?? '', {
              shouldDirty: true,
              shouldTouch: true,
            })
          }
          error={form.formState.errors.category_id?.message}
        />
        <CourseFactsCard form={form} />
        <CourseSettingsCard form={form} />
      </CollapsibleContent>
    </Collapsible>
  );
}
