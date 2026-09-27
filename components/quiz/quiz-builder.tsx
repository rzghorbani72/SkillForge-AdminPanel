'use client';

import { useCallback, useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useTranslation } from '@/lib/i18n/hooks';
import { QuizCreateForm } from './quiz-create-form';
import { QuizGrading } from './quiz-grading';
import { QuizHeaderCard, type QuizDetails } from './quiz-header-card';
import { QuizQuestionForm } from './quiz-question-form';
import { QuizQuestionList } from './quiz-question-list';
import type { QuestionPayload, Quiz, QuizParent, QuizSettings } from './quiz-types';

interface QuizBuilderProps {
  parent: QuizParent;
}

export function QuizBuilder({ parent }: QuizBuilderProps) {
  // Keyed on the parts, so an inline `parent` object does not reload every render.
  const { kind, id } = parent;
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setQuiz(
        await (kind === 'lesson'
          ? apiClient.getLessonQuiz<Quiz>(id)
          : apiClient.getSessionQuiz<Quiz>(id)),
      );
    } catch {
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }, [kind, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>): Promise<boolean> => {
    setError(null);
    try {
      await fn();
      await load();
      return true;
    } catch (e) {
      setError(apiErrorMessage(e, t('quiz.actionFailed')));
      return false;
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;

  const isLessonQuiz = kind === 'lesson';
  if (!quiz) {
    const parentKey = isLessonQuiz ? { lesson_id: id } : { tutoring_session_id: id };
    return (
      <QuizCreateForm
        error={error}
        isLessonQuiz={isLessonQuiz}
        onCreate={(title: string, settings: QuizSettings) =>
          run(() => apiClient.createQuiz({ ...parentKey, title, ...settings }))
        }
      />
    );
  }

  const quizId = quiz.id;
  const saveDetails = (details: QuizDetails) => run(() => apiClient.updateQuiz(quizId, details));
  const addQuestion = (payload: QuestionPayload) =>
    run(() => apiClient.addQuizQuestion(quizId, payload));
  const updateQuestion = (questionId: string, payload: QuestionPayload) =>
    run(() => apiClient.updateQuizQuestion(questionId, payload));

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <QuizHeaderCard
        quiz={quiz}
        onSave={saveDetails}
        onTogglePublish={() => run(() => apiClient.setQuizPublished(quizId, !quiz.is_published))}
      >
        {error && <p className="text-sm text-destructive">{error}</p>}
        <QuizQuestionList
          questions={quiz.Question}
          onUpdate={updateQuestion}
          onDelete={(id) => run(() => apiClient.deleteQuizQuestion(id))}
          onReorder={(ids) => run(() => apiClient.reorderQuizQuestions(quizId, ids))}
        />
      </QuizHeaderCard>

      <Card>
        <CardHeader>
          <CardTitle>{t('quiz.addQuestion')}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizQuestionForm onSubmit={addQuestion} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('quiz.attemptReview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizGrading quizId={quizId} />
        </CardContent>
      </Card>
    </div>
  );
}
