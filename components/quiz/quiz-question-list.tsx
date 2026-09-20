'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { QuizQuestionForm } from './quiz-question-form';
import type { QuestionPayload, QuizQuestion } from './quiz-types';

interface Props {
  questions: QuizQuestion[];
  locked: boolean;
  onUpdate: (questionId: string, payload: QuestionPayload) => Promise<boolean>;
  onDelete: (questionId: string) => Promise<boolean>;
  onReorder: (questionIds: string[]) => Promise<boolean>;
}

export function QuizQuestionList({ questions, locked, onUpdate, onDelete, onReorder }: Props) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('quiz.noQuestions')}</p>;
  }

  const move = (index: number, direction: -1 | 1) => {
    const ids = questions.map((q) => q.id);
    const target = index + direction;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    return onReorder(ids);
  };

  return (
    <div className="space-y-3">
      {questions.map((q, i) =>
        editingId === q.id ? (
          <div key={q.id} className="rounded-md border p-3">
            <QuizQuestionForm
              initial={q}
              onSubmit={async (payload) => {
                const ok = await onUpdate(q.id, payload);
                if (ok) setEditingId(null);
                return ok;
              }}
              onCancel={() => setEditingId(null)}
            />
          </div>
        ) : (
          <div key={q.id} className="flex items-start justify-between gap-2 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">
                {i + 1}. {q.prompt}{' '}
                <span className="text-xs text-muted-foreground">
                  ({t(`quiz.type.${q.type}`)} · {t('quiz.pointsValue', { count: q.points })})
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
                  {t('quiz.answer')}: {q.correct_boolean ? t('common.yes') : t('common.no')}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center">
              <Button
                size="sm"
                variant="ghost"
                disabled={locked || i === 0}
                onClick={() => move(i, -1)}
                aria-label={t('quiz.moveUp')}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={locked || i === questions.length - 1}
                onClick={() => move(i, 1)}
                aria-label={t('quiz.moveDown')}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={locked}
                onClick={() => setEditingId(q.id)}
                aria-label={t('quiz.editQuestion')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={locked}
                onClick={() => onDelete(q.id)}
                aria-label={t('quiz.deleteQuestion')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
