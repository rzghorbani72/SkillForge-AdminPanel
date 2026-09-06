'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { useCurriculumDraft } from '../useCurriculumDraft';
import CreateCourseAssociations from '../CreateCourseAssociations';
import CourseSettingsCard from '../CourseSettingsCard';
import { SeasonsSection } from '../SeasonsSection';
import type { CourseFormData } from '../schema';

type Curriculum = ReturnType<typeof useCurriculumDraft>;

type StepContentProps = {
  form: UseFormReturn<CourseFormData>;
  curriculum: Curriculum;
};

/**
 * Step 2 — the course's category and everything students will watch, read or
 * download: seasons, lessons, and each lesson's video and attached file.
 */
export function StepContent({ form, curriculum }: StepContentProps) {
  return (
    <div className="space-y-6">
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

      <SeasonsSection
        seasons={curriculum.seasons}
        lessons={curriculum.lessons}
        onAddSeason={curriculum.addSeason}
        onRemoveSeason={curriculum.removeSeason}
        onClearSeason={curriculum.clearSeason}
        onUpdateSeason={curriculum.updateSeason}
        onReorderSeasons={curriculum.reorderSeasons}
        onAddLesson={curriculum.addLesson}
        onRemoveLesson={curriculum.removeLesson}
        onClearLesson={curriculum.clearLesson}
        onUpdateLesson={curriculum.updateLesson}
        onAssignLesson={curriculum.assignLesson}
        onReorderLessons={curriculum.reorderLessons}
      />

      <CourseSettingsCard form={form} />
    </div>
  );
}
