'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormLabel } from '@/components/ui/form';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';
import { useTranslation } from '@/lib/i18n/hooks';
import CreateCourseBasicInfo from '../CreateCourseBasicInfo';
import CreateCourseAssociations from '../CreateCourseAssociations';
import CourseSettingsCard from '../CourseSettingsCard';
import { CourseTypePicker } from '../course-type-picker';
import type { CourseType } from '../course-drafts';
import type { CourseFormData } from '../schema';

type StepBasicsProps = {
  form: UseFormReturn<CourseFormData>;
  courseType: CourseType;
  /** Missing on a saved course: the type is fixed once the course exists. */
  onCourseTypeChange?: (type: CourseType) => void;
  coverPreviewUrl: string | null;
  onCoverChange: (image: { id: string; url: string }) => void;
};

/**
 * Step 1 — what the course is: its type, title, description, cover, category
 * and the two switches that apply to the whole course. Every course type has
 * this step, so nothing here may depend on there being a lesson tree.
 */
export function StepBasics({
  form,
  courseType,
  onCourseTypeChange,
  coverPreviewUrl,
  onCoverChange
}: StepBasicsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-muted-foreground">
              {t('courses.wizard.typeLockedHint')}
            </p>
          )}
        </CardContent>
      </Card>

      <CreateCourseBasicInfo form={form} />

      <CreateCourseAssociations
        categoryId={form.watch('category_id')}
        onCategoryChange={(id) =>
          form.setValue('category_id', id ?? '', {
            shouldDirty: true,
            shouldTouch: true
          })
        }
        error={form.formState.errors.category_id?.message}
      />

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
            className="aspect-video w-full max-w-md"
            placeholderText={t('courses.noCoverImageSelected')}
            placeholderSubtext={t('courses.uploadImageToPreview')}
          />
        </CardContent>
      </Card>

      <CourseSettingsCard form={form} />
    </div>
  );
}
