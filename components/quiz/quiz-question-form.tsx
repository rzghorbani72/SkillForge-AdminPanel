'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OptionDraft, QuestionPayload, QuestionType, QuizQuestion } from './quiz-types';

const QUESTION_TYPES: QuestionType[] = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_TEXT'];

const blankOptions = (): OptionDraft[] => [
  { text: '', is_correct: true },
  { text: '', is_correct: false },
];

interface Props {
  initial?: QuizQuestion;
  onSubmit: (payload: QuestionPayload) => Promise<boolean>;
  onCancel?: () => void;
}

export function QuizQuestionForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const [type, setType] = useState<QuestionType>(initial?.type ?? 'MULTIPLE_CHOICE');
  const [prompt, setPrompt] = useState(initial?.prompt ?? '');
  const [points, setPoints] = useState(initial?.points ?? 1);
  const [tfAnswer, setTfAnswer] = useState(initial?.correct_boolean ?? true);
  const [options, setOptions] = useState<OptionDraft[]>(
    initial?.Option.length
      ? initial.Option.map(({ text, is_correct }) => ({ text, is_correct }))
      : blankOptions(),
  );
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    const base = { prompt: prompt.trim(), points };
    const payload: QuestionPayload =
      type === 'MULTIPLE_CHOICE'
        ? { type, ...base, options }
        : type === 'TRUE_FALSE'
          ? { type, ...base, correct_boolean: tfAnswer }
          : { type, ...base };
    setIsSaving(true);
    try {
      const ok = await onSubmit(payload);
      if (ok && !initial) {
        setPrompt('');
        setPoints(1);
        setOptions(blankOptions());
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('quiz.questionType')}</Label>
          <Select
            value={type}
            onValueChange={(v) => {
              const next = QUESTION_TYPES.find((qt) => qt === v);
              if (next) setType(next);
            }}
            disabled={Boolean(initial)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((qt) => (
                <SelectItem key={qt} value={qt}>
                  {t(`quiz.type.${qt}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('quiz.points')}</Label>
          <NumberInput
            value={points}
            min={1}
            onChange={(raw) => setPoints(raw === '' ? 1 : Number(raw))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('quiz.prompt')}</Label>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} />
      </div>

      {type === 'MULTIPLE_CHOICE' && (
        <div className="space-y-2">
          <Label>{t('quiz.optionsHelp')}</Label>
          {options.map((o, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-option-${initial?.id ?? 'new'}`}
                checked={o.is_correct}
                onChange={() =>
                  setOptions((prev) => prev.map((p, i) => ({ ...p, is_correct: i === idx })))
                }
              />
              <Input
                value={o.text}
                onChange={(e) =>
                  setOptions((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, text: e.target.value } : p)),
                  )
                }
                placeholder={t('quiz.optionNumber', { number: idx + 1 })}
              />
              {options.length > 2 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOptions((prev) => prev.filter((_, i) => i !== idx))}
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
            onClick={() => setOptions((prev) => [...prev, { text: '', is_correct: false }])}
          >
            <Plus className="me-1 h-4 w-4" /> {t('quiz.addOption')}
          </Button>
        </div>
      )}

      {type === 'TRUE_FALSE' && (
        <div className="space-y-2">
          <Label>{t('quiz.correctAnswer')}</Label>
          <div className="flex gap-4">
            {[true, false].map((v) => (
              <label key={String(v)} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`tf-${initial?.id ?? 'new'}`}
                  checked={tfAnswer === v}
                  onChange={() => setTfAnswer(v)}
                />
                {v ? t('common.yes') : t('common.no')}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={submit} disabled={prompt.trim().length < 1 || isSaving}>
          {initial ? (
            t('quiz.saveChanges')
          ) : (
            <>
              <Plus className="me-1 h-4 w-4" /> {t('quiz.addQuestion')}
            </>
          )}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </div>
  );
}
