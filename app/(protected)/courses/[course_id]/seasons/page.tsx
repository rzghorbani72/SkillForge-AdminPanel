'use client';

import { useParams } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

import NoAcademyState from '@/components/course/NoAcademyState';
import { SaveStatusIndicator } from '@/components/course/SaveStatusIndicator';
import { SeasonsSection } from '@/components/course/SeasonsSection';
import { useCourseForm } from '@/components/course/useCourseForm';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * The one place a course's curriculum is built. Seasons and lessons are edited
 * as a draft and saved together, so reordering a season and renaming a lesson
 * is one save rather than a request per keystroke.
 */
export default function CourseCurriculumPage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  const { t } = useTranslation();
  const {
    isLoading,
    isSaving,
    saveStatus,
    seasons,
    lessons,
    selectedAcademy,
    addSeason,
    removeSeason,
    clearSeason,
    updateSeason,
    reorderSeasons,
    addLesson,
    removeLesson,
    clearLesson,
    updateLesson,
    assignLesson,
    reorderLessons,
    retrySave,
    saveNow
  } = useCourseForm(courseId);

  if (!selectedAcademy) return <NoAcademyState />;

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <SeasonsSection
        seasons={seasons}
        lessons={lessons}
        onAddSeason={addSeason}
        onRemoveSeason={removeSeason}
        onClearSeason={clearSeason}
        onUpdateSeason={updateSeason}
        onReorderSeasons={reorderSeasons}
        onAddLesson={addLesson}
        onRemoveLesson={removeLesson}
        onClearLesson={clearLesson}
        onUpdateLesson={updateLesson}
        onAssignLesson={assignLesson}
        onReorderLessons={reorderLessons}
      />

      <div className="flex items-center justify-end gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <SaveStatusIndicator status={saveStatus} onRetry={retrySave} />
        <Button
          type="button"
          disabled={isSaving}
          onClick={() => void saveNow()}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {t('common.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
