'use client';

import { ClipboardList } from 'lucide-react';

import {
  LessonAssignmentEditor,
  type AssignmentParent,
} from '@/components/lesson/lesson-assignment-editor';
import { useTranslation } from '@/lib/i18n/hooks';
import { SectionDialog } from './section-dialog';

const KEYS: Record<AssignmentParent['kind'], { label: string; hint: string; saveFirst: string }> = {
  lesson: {
    label: 'courses.lessonAssignment',
    hint: 'courses.live.homeworkLessonHint',
    saveFirst: 'courses.assessmentSaveFirst',
  },
  season: {
    label: 'courses.seasonAssignment',
    hint: 'courses.live.homeworkSeasonHint',
    saveFirst: 'courses.seasonAssessmentSaveFirst',
  },
};

interface AssignmentDialogProps {
  kind: AssignmentParent['kind'];
  /** Unset until the lesson or season is saved. */
  parentId: string | undefined;
  courseId: string;
  title: string;
}

export function AssignmentDialog({ kind, parentId, courseId, title }: AssignmentDialogProps) {
  const { t } = useTranslation();
  const keys = KEYS[kind];
  if (!parentId) return <p className="text-xs text-muted-foreground">{t(keys.saveFirst)}</p>;

  return (
    <SectionDialog
      triggerLabel={t(keys.label)}
      Icon={ClipboardList}
      title={title || t(keys.label)}
      description={t(keys.hint)}
    >
      <div className="space-y-4">
        <LessonAssignmentEditor parent={{ kind, id: parentId }} courseId={courseId} />
      </div>
    </SectionDialog>
  );
}
