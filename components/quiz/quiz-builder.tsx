'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { QuizGrading } from './quiz-grading';
import { apiErrorMessage } from '@/lib/api-error-message';

type QType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT';

interface Option {
  id: string;
  text: string;
  is_correct: boolean;
}
interface Question {
  id: string;
  type: QType;
  prompt: string;
  points: number;
  order: number;
  correct_boolean?: boolean | null;
  Option: Option[];
}
interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  passing_score: number;
  is_published: boolean;
  Question: Question[];
}

interface QuizBuilderProps {
  lessonId: string;
}

const BLANK_OPTIONS = () => [
  { text: '', is_correct: true },
  { text: '', is_correct: false }
];

/** Teacher quiz authoring: create the quiz, add/remove questions, publish. */
export function QuizBuilder({ lessonId }: QuizBuilderProps) {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create-quiz form
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(0);

  // add-question form
  const [qType, setQType] = useState<QType>('MULTIPLE_CHOICE');
  const [prompt, setPrompt] = useState('');
  const [points, setPoints] = useState(1);
  const [tfAnswer, setTfAnswer] = useState(true);
  const [options, setOptions] =
    useState<{ text: string; is_correct: boolean }[]>(BLANK_OPTIONS());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = await apiClient.getLessonQuiz<Quiz>(lessonId);
      setQuiz(q);
    } catch {
      setQuiz(null); // no quiz yet
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(apiErrorMessage(e, t('quiz.actionFailed')));
    }
  };

  const createQuiz = () =>
    run(async () => {
      await apiClient.createQuiz({
        lesson_id: lessonId,
        title,
        passing_score: passingScore
      });
    });

  const addQuestion = () =>
    run(async () => {
      if (!quiz) return;
      const payload =
        qType === 'MULTIPLE_CHOICE'
          ? { type: qType, prompt, points, options }
          : qType === 'TRUE_FALSE'
            ? { type: qType, prompt, points, correct_boolean: tfAnswer }
            : { type: qType, prompt, points };
      await apiClient.addQuizQuestion(quiz.id, payload);
      setPrompt('');
      setPoints(1);
      setOptions(BLANK_OPTIONS());
    });

  const deleteQuestion = (id: string) =>
    run(() => apiClient.deleteQuizQuestion(id));
  const togglePublish = () =>
    run(() => apiClient.setQuizPublished(quiz!.id, !quiz!.is_published));

  if (loading)
    return (
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    );

  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('quiz.createForLesson')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('common.title')}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('quiz.titlePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('quiz.passingScore')}</Label>
            <NumberInput
              value={passingScore}
              onChange={(raw) => setPassingScore(raw === '' ? 0 : Number(raw))}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={createQuiz} disabled={title.trim().length < 2}>
            {t('quiz.create')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalPoints = quiz.Question.reduce((s, q) => s + q.points, 0);
  const hasAttemptsLock = false; // structural edits are blocked server-side once attempts exist

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('quiz.summary', {
                questions: quiz.Question.length,
                points: totalPoints,
                passing: quiz.passing_score
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={quiz.is_published ? 'default' : 'outline'}>
              {quiz.is_published ? t('courses.published') : t('courses.draft')}
            </Badge>
            <Button
              size="sm"
              variant={quiz.is_published ? 'outline' : 'default'}
              onClick={togglePublish}
            >
              {quiz.is_published ? t('quiz.unpublish') : t('quiz.publish')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {quiz.Question.map((q, i) => (
            <div
              key={q.id}
              className="flex items-start justify-between rounded-md border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {i + 1}. {q.prompt}{' '}
                  <span className="text-xs text-muted-foreground">
                    ({t(`quiz.type.${q.type}`)} ·{' '}
                    {t('quiz.pointsValue', { count: q.points })})
                  </span>
                </p>
                {q.type === 'MULTIPLE_CHOICE' && (
                  <ul className="mt-1 text-xs text-muted-foreground">
                    {q.Option.map((o) => (
                      <li key={o.id}>
                        {o.is_correct ? '✓ ' : '• '}
                        {o.text}
                      </li>
                    ))}
                  </ul>
                )}
                {q.type === 'TRUE_FALSE' && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('quiz.answer')}:{' '}
                    {q.correct_boolean ? t('common.yes') : t('common.no')}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteQuestion(q.id)}
                aria-label={t('quiz.deleteQuestion')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {quiz.Question.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('quiz.noQuestions')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('quiz.addQuestion')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('quiz.questionType')}</Label>
              <select
                value={qType}
                onChange={(e) => setQType(e.target.value as QType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="MULTIPLE_CHOICE">
                  {t('quiz.type.MULTIPLE_CHOICE')}
                </option>
                <option value="TRUE_FALSE">{t('quiz.type.TRUE_FALSE')}</option>
                <option value="SHORT_TEXT">{t('quiz.type.SHORT_TEXT')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t('quiz.points')}</Label>
              <NumberInput
                value={points}
                onChange={(raw) => setPoints(raw === '' ? 1 : Number(raw))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('quiz.prompt')}</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
            />
          </div>

          {qType === 'MULTIPLE_CHOICE' && (
            <div className="space-y-2">
              <Label>{t('quiz.optionsHelp')}</Label>
              {options.map((o, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={o.is_correct}
                    onChange={() =>
                      setOptions((prev) =>
                        prev.map((p, i) => ({ ...p, is_correct: i === idx }))
                      )
                    }
                  />
                  <Input
                    value={o.text}
                    onChange={(e) =>
                      setOptions((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, text: e.target.value } : p
                        )
                      )
                    }
                    placeholder={t('quiz.optionNumber', { number: idx + 1 })}
                  />
                  {options.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setOptions((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t('common.delete')}</span>
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setOptions((prev) => [
                    ...prev,
                    { text: '', is_correct: false }
                  ])
                }
              >
                <Plus className="me-1 h-4 w-4" /> {t('quiz.addOption')}
              </Button>
            </div>
          )}

          {qType === 'TRUE_FALSE' && (
            <div className="space-y-2">
              <Label>{t('quiz.correctAnswer')}</Label>
              <div className="flex gap-4">
                {[true, false].map((v) => (
                  <label
                    key={String(v)}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="tf"
                      checked={tfAnswer === v}
                      onChange={() => setTfAnswer(v)}
                    />
                    {v ? t('common.yes') : t('common.no')}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={addQuestion}
            disabled={prompt.trim().length < 1 || hasAttemptsLock}
          >
            <Plus className="me-1 h-4 w-4" /> {t('quiz.addQuestion')}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('quiz.attemptReview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizGrading quizId={quiz.id} />
        </CardContent>
      </Card>
    </div>
  );
}
