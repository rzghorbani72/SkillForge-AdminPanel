'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormLabel } from '@/components/ui/form';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';
import { useTranslation } from '@/lib/i18n/hooks';
import CreateCourseBasicInfo from '../CreateCourseBasicInfo';
import CreateCourseAssociations from '../CreateCourseAssociations';
import CourseFactsCard from '../CourseFactsCard';
import CourseSettingsCard from '../CourseSettingsCard';
import { CourseTypePicker } from '../course-type-picker';
import type { CourseType } from '../course-drafts';
import type { CourseFormData } from '../schema';
import { CourseLearningFields } from '../course-learning-fields';
import { LiveBasicsCard } from './live/live-basics-card';
import { SectionCard } from '@/components/shared/section-card';

type StepBasicsProps = {
  form: UseFormReturn<CourseFormData>;
  courseType: CourseType;
  /** Missing on a saved course: the type is fixed once the course exists. */
  onCourseTypeChange?: (type: CourseType) => void;
  coverPreviewUrl: string | null;
  onCoverChange: (image: { id: string; url: string }) => void;
};

/**
 * Step 1 — what the course is. Every course type has this step, so nothing
 * here may depend on there being a lesson tree. A live course shares the page
 * with its class summary, so it is one column with the extras folded away.
 */
export function StepBasics({
  form,
  courseType,
  onCourseTypeChange,
  coverPreviewUrl,
  onCoverChange,
}: StepBasicsProps) {
  const { t } = useTranslation();
  const isLive = courseType === 'LIVE';

  const typeCard = (
    <Card>
      <CardHeader>
        <CardTitle>{t('courses.courseTypeLabel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <CourseTypePicker
          value={courseType}
          onChange={(type) => onCourseTypeChange?.(type)}
          disabled={!onCourseTypeChange}
        />
        {!onCourseTypeChange && (
          <p className="text-xs text-muted-foreground">{t('courses.wizard.typeLockedHint')}</p>
        )}
      </CardContent>
    </Card>
  );

  const coverCard = (
    <Card>
      <CardHeader>
        <CardTitle>{t('courses.coverImage')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <FormLabel className="sr-only">{t('courses.coverImage')}</FormLabel>
        <ImageUploadPreview
          title={form.watch('title')}
          description={form.watch('description')}
          existingImageUrl={coverPreviewUrl}
          onSuccess={onCoverChange}
          selectedImageId={form.watch('cover_id')}
          className="aspect-video w-full"
          placeholderText={t('courses.noCoverImageSelected')}
          placeholderSubtext={t('courses.uploadImageToPreview')}
        />
      </CardContent>
    </Card>
  );

  const associations = (
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
  );

  if (isLive) {
    return (
      <Collapsible className="flex flex-col gap-4">
        {onCourseTypeChange ? (
          <SectionCard title={t('courses.courseTypeLabel')}>
            <CourseTypePicker value={courseType} onChange={onCourseTypeChange} />
          </SectionCard>
        ) : null}
        <LiveBasicsCard form={form} coverPreviewUrl={coverPreviewUrl} onCoverChange={onCoverChange}>
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
        </LiveBasicsCard>
        <CollapsibleContent className="grid gap-4 md:grid-cols-2">
          <SectionCard>
            <CourseLearningFields form={form} />
          </SectionCard>
          {associations}
          <CourseFactsCard form={form} hideLevel />
          <CourseSettingsCard form={form} />
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        {typeCard}
        <div className="flex flex-1 flex-col *:flex-1">
          <CreateCourseBasicInfo form={form} />
        </div>
      </div>

      <div className="space-y-6">
        {coverCard}
        {associations}
        <CourseFactsCard form={form} />
        <CourseSettingsCard form={form} />
      </div>
    </div>
  );
}
