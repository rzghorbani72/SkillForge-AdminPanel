'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OptionDraft, QuestionPayload, QuizQuestion } from './quiz-types';

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
  const [prompt, setPrompt] = useState(initial?.prompt ?? '');
  const [points, setPoints] = useState(initial?.points ?? 1);
  const [options, setOptions] = useState<OptionDraft[]>(
    initial?.Option.length
      ? initial.Option.map(({ text, is_correct }) => ({ text, is_correct }))
      : blankOptions(),
  );
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    const payload: QuestionPayload = { prompt: prompt.trim(), points, options };
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
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="space-y-2">
          <Label>{t('quiz.prompt')}</Label>
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} />
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
