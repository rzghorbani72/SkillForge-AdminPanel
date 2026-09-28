'use client';

import { ListChecks } from 'lucide-react';

import { QuizBuilder } from '@/components/quiz/quiz-builder';
import type { QuizParent } from '@/components/quiz/quiz-types';
import { useTranslation } from '@/lib/i18n/hooks';
import { SectionDialog } from './section-dialog';

type CourseQuizKind = Exclude<QuizParent['kind'], 'session'>;

const KEYS: Record<CourseQuizKind, { label: string; hint: string; saveFirst: string }> = {
  lesson: {
    label: 'courses.lessonQuiz',
    hint: 'courses.lessonQuizHint',
    saveFirst: 'courses.assessmentSaveFirst',
  },
  season: {
    label: 'courses.seasonQuiz',
    hint: 'courses.seasonQuizHint',
    saveFirst: 'courses.seasonAssessmentSaveFirst',
  },
  course: {
    label: 'courses.courseQuiz',
    hint: 'courses.courseQuizHint',
    saveFirst: 'courses.courseQuizSaveFirst',
  },
};

interface QuizDialogProps {
  kind: CourseQuizKind;
  /** Unset until the lesson, season or course is saved. */
  parentId: string | undefined;
  title: string;
}

export function QuizDialog({ kind, parentId, title }: QuizDialogProps) {
  const { t } = useTranslation();
  const keys = KEYS[kind];
  if (!parentId) return <p className="text-xs text-muted-foreground">{t(keys.saveFirst)}</p>;

  return (
    <SectionDialog
      triggerLabel={t(keys.label)}
      Icon={ListChecks}
      title={title || t(keys.label)}
      description={t(keys.hint)}
    >
      <QuizBuilder parent={{ kind, id: parentId }} />
    </SectionDialog>
  );
}
