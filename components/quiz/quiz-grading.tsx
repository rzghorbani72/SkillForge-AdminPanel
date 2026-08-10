'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { DiscussionThread } from '@/components/discussion/discussion-thread';
import { useTranslation } from '@/lib/i18n/hooks';

interface Attempt {
  id: string;
  status: 'IN_PROGRESS' | 'PENDING_REVIEW' | 'GRADED';
  score: number;
  max_score: number;
  passed?: boolean | null;
  Profile?: { id: string; display_name: string | null };
}
interface AttemptDetail extends Attempt {
  Answer: {
    id: string;
    question_id: string;
    answer_text?: string | null;
    awarded_points: number;
    is_correct?: boolean | null;
    Question?: { type: string; prompt: string; points: number };
  }[];
  Quiz?: {
    Question: { id: string; type: string; prompt: string; points: number }[];
  };
}

interface QuizGradingProps {
  quizId: string;
  currentProfileId?: string;
}

const statusVariant = (s: Attempt['status']) =>
  s === 'GRADED' ? 'default' : s === 'PENDING_REVIEW' ? 'outline' : 'secondary';

/** Teacher review/grading screen: pick an attempt, score short-text answers, finalize, discuss. */
export function QuizGrading({ quizId, currentProfileId }: QuizGradingProps) {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AttemptDetail | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadAttempts = useCallback(async () => {
    try {
      setLoading(true);
      const list = await apiClient.listQuizAttempts<Attempt[]>(quizId);
      setAttempts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('quiz.loadAttemptsFailed'));
    } finally {
      setLoading(false);
    }
  }, [quizId, t]);

  useEffect(() => {
    void loadAttempts();
  }, [loadAttempts]);

  const openAttempt = async (id: string) => {
    setError(null);
    try {
      const detail = await apiClient.getQuizAttempt<AttemptDetail>(id);
      setSelected(detail);
      setFeedback('');
      const initial: Record<string, number> = {};
      detail.Answer.forEach((a) => (initial[a.id] = a.awarded_points));
      setScores(initial);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('quiz.openAttemptFailed'));
    }
  };

  const shortAnswers = (selected?.Answer ?? []).filter(
    (a) => a.Question?.type === 'SHORT_TEXT'
  );

  const finalize = async () => {
    if (!selected) return;
    setError(null);
    try {
      for (const a of shortAnswers) {
        await apiClient.gradeQuizAnswer(a.id, scores[a.id] ?? 0);
      }
      await apiClient.reviewQuizAttempt(selected.id, feedback || undefined);
      await loadAttempts();
      await openAttempt(selected.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('quiz.finalizeFailed'));
    }
  };

  return (
    <div
      className="grid gap-6 md:grid-cols-[280px_1fr]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('quiz.attempts')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && (
            <p className="text-sm text-muted-foreground">
              {t('common.loading')}
            </p>
          )}
          {!loading && attempts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('quiz.noAttempts')}
            </p>
          )}
          {attempts.map((a) => (
            <button
              key={a.id}
              onClick={() => openAttempt(a.id)}
              className={`flex w-full items-center justify-between rounded-md border p-2 text-left text-sm ${selected?.id === a.id ? 'border-primary' : ''}`}
            >
              <span>
                {a.Profile?.display_name ?? t('students.unknownStudent')}
              </span>
              <Badge variant={statusVariant(a.status)}>
                {a.status === 'PENDING_REVIEW'
                  ? t('quiz.review')
                  : a.status === 'GRADED'
                    ? t('assignmentsPage.graded')
                    : '…'}
              </Badge>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!selected && (
          <p className="text-sm text-muted-foreground">
            {t('quiz.selectAttempt')}
          </p>
        )}

        {selected && (
          <>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>
                  {selected.Profile?.display_name ??
                    t('students.unknownStudent')}
                </CardTitle>
                <Badge variant={statusVariant(selected.status)}>
                  {selected.score} / {selected.max_score}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {shortAnswers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('quiz.autoGraded')}
                  </p>
                )}
                {shortAnswers.map((a) => (
                  <div key={a.id} className="space-y-2 rounded-md border p-3">
                    <p className="text-sm font-medium">{a.Question?.prompt}</p>
                    <p className="whitespace-pre-wrap rounded bg-muted p-2 text-sm">
                      {a.answer_text || <em>{t('quiz.noAnswer')}</em>}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t('quiz.scoreMax', {
                          max: a.Question?.points ?? 0
                        })}
                      </span>
                      <NumberInput
                        className="w-24"
                        value={scores[a.id] ?? 0}
                        onChange={(raw) =>
                          setScores((prev) => ({
                            ...prev,
                            [a.id]: raw === '' ? 0 : Number(raw)
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}

                {selected.status !== 'GRADED' && (
                  <div className="space-y-2">
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={2}
                      placeholder={t('quiz.feedbackPlaceholder')}
                      maxLength={2000}
                    />
                    <Button onClick={finalize}>
                      {t('quiz.finalizeGrade')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <DiscussionThread
                  attemptId={selected.id}
                  currentProfileId={currentProfileId}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
