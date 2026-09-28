'use client';

import { useParams } from 'next/navigation';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import type { useCurriculumDraft } from '../useCurriculumDraft';
import { SeasonsSection } from '../SeasonsSection';
import { QuizDialog } from '../assessment/quiz-dialog';

type Curriculum = ReturnType<typeof useCurriculumDraft>;

type StepContentProps = {
  curriculum: Curriculum;
};

/**
 * Step 2 — everything students will watch, read or download: seasons, lessons,
 * and each lesson's video and attached file. A live course skips this step.
 */
export function StepContent({ curriculum }: StepContentProps) {
  const { t } = useTranslation();
  const { course_id: courseId } = useParams<{ course_id?: string }>();

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

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">{t('courses.courseQuiz')}</CardTitle>
            <CardDescription>{t('courses.courseQuizHint')}</CardDescription>
          </div>
          <QuizDialog kind="course" parentId={courseId} title={t('courses.courseQuiz')} />
        </CardHeader>
      </Card>
    </div>
  );
}
