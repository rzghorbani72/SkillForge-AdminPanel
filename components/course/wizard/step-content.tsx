'use client';

import type { useCurriculumDraft } from '../useCurriculumDraft';
import { SeasonsSection } from '../SeasonsSection';

type Curriculum = ReturnType<typeof useCurriculumDraft>;

type StepContentProps = {
  curriculum: Curriculum;
};

/**
 * Step 2 — everything students will watch, read or download: seasons, lessons,
 * and each lesson's video and attached file. A live course skips this step.
 */
export function StepContent({ curriculum }: StepContentProps) {
  return (
    <div className="space-y-6">
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
    </div>
  );
}
