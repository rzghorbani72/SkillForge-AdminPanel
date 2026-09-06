'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { LessonDownloadPolicyEditor } from '@/components/lesson/lesson-download-policy-editor';
import LiveSessionEditor from '@/components/lesson/LiveSessionEditor';
import { QuizBuilder } from '@/components/quiz/quiz-builder';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Lesson } from '@/types/api';

/**
 * The few lesson settings the curriculum editor cannot hold inline, because
 * each one is a screen of its own: when a live class meets, the questions of a
 * quiz, and who may download the file. Everything else about a lesson — its
 * title, type, media and visibility — is edited in the curriculum.
 */
export default function LessonSettingsPage() {
  const { course_id: courseId, lesson_id: lessonId } = useParams<{
    course_id: string;
    lesson_id: string;
  }>();
  const { t } = useTranslation();
  // The lesson id alone would load, so a lesson reached under the wrong
  // course's address reads as not found rather than opening here.
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setLesson(await apiClient.getLesson(lessonId));
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setLesson(null);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <Link
        href={`/courses/${courseId}/edit?step=content`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('courses.backToCurriculum')}
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !lesson || String(lesson.course_id) !== courseId ? (
        <p className="text-sm text-muted-foreground">
          {t('courses.lessonNotFound')}
        </p>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('courses.lessonSettingsHint')}
            </p>
          </div>

          {lesson.lesson_type === 'LIVE' && (
            <LiveSessionEditor
              lessonId={lesson.id}
              initial={lesson.LiveSession ?? null}
              onSaved={() => void load()}
            />
          )}

          {lesson.lesson_type === 'QUIZ' && (
            <QuizBuilder lessonId={lesson.id} />
          )}

          <LessonDownloadPolicyEditor lesson={lesson} />
        </>
      )}
    </main>
  );
}
