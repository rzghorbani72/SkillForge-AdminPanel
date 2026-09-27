'use client';

import { ClipboardList, ListChecks } from 'lucide-react';
import { useState } from 'react';

import { LessonAssignmentEditor } from '@/components/lesson/lesson-assignment-editor';
import { QuizBuilder } from '@/components/quiz/quiz-builder';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n/hooks';

type AssessmentTab = 'quiz' | 'assignment';

interface LessonAssessmentDialogProps {
  lessonId: string | undefined;
  courseId: string;
  lessonTitle: string;
}

/**
 * Quiz and assignment of one lesson, edited without leaving the curriculum.
 * The question list has no natural size, so only the tab body scrolls.
 */
export function LessonAssessmentDialog({
  lessonId,
  courseId,
  lessonTitle,
}: LessonAssessmentDialogProps) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AssessmentTab>('quiz');
  const dir = language === 'fa' || language === 'ar' ? 'rtl' : 'ltr';

  const openAt = (next: AssessmentTab) => {
    setTab(next);
    setOpen(true);
  };

  if (!lessonId) {
    return <p className="text-xs text-muted-foreground">{t('courses.assessmentSaveFirst')}</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => openAt('quiz')}>
          <ListChecks className="me-1 h-4 w-4" />
          {t('courses.lessonQuiz')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => openAt('assignment')}>
          <ClipboardList className="me-1 h-4 w-4" />
          {t('courses.lessonAssignment')}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{lessonTitle || t('courses.assessmentTitle')}</DialogTitle>
            <DialogDescription>{t('courses.assessmentHint')}</DialogDescription>
          </DialogHeader>

          <Tabs
            dir={dir}
            value={tab}
            onValueChange={(v) => setTab(v === 'assignment' ? 'assignment' : 'quiz')}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="w-full justify-start">
              <TabsTrigger value="quiz">{t('courses.lessonQuiz')}</TabsTrigger>
              <TabsTrigger value="assignment">{t('courses.lessonAssignment')}</TabsTrigger>
            </TabsList>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pe-1">
              <TabsContent value="quiz" className="mt-0">
                <QuizBuilder parent={{ kind: 'lesson', id: lessonId }} />
              </TabsContent>
              <TabsContent value="assignment" className="mt-0 space-y-4">
                <LessonAssignmentEditor lessonId={lessonId} courseId={courseId} />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
