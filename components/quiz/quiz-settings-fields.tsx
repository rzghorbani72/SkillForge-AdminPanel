'use client';

import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/hooks';
import type { QuizSettings } from './quiz-types';

interface Props {
  value: QuizSettings;
  onChange: (next: QuizSettings) => void;
  /** Questions in the bank today, shown next to the draw size. */
  bankSize?: number;
  /** Gate and final-exam switches only make sense on a course lesson. */
  isCourseQuiz: boolean;
}

/** An empty box means "no limit", so it maps to null rather than 0. */
const optionalCount = (raw: string): number | null =>
  raw === '' ? null : Math.max(1, Number(raw));

export function QuizSettingsFields({ value, onChange, bankSize, isCourseQuiz }: Props) {
  const { t } = useTranslation();
  const set = (patch: Partial<QuizSettings>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label>{t('quiz.passPercent')}</Label>
        <NumberInput
          value={value.pass_percent}
          min={0}
          max={100}
          suffix="%"
          onChange={(raw) => set({ pass_percent: Math.min(100, raw === '' ? 0 : Number(raw)) })}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('quiz.questionsPerAttempt')}</Label>
        <NumberInput
          value={value.questions_per_attempt ?? ''}
          min={1}
          placeholder={t('quiz.allQuestions')}
          onChange={(raw) => set({ questions_per_attempt: optionalCount(raw) })}
        />
        {bankSize !== undefined && (
          <p className="text-xs text-muted-foreground">{t('quiz.bankSize', { count: bankSize })}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>{t('quiz.maxAttempts')}</Label>
        <NumberInput
          value={value.max_attempts ?? ''}
          min={1}
          placeholder={t('quiz.unlimited')}
          onChange={(raw) => set({ max_attempts: optionalCount(raw) })}
        />
      </div>

      {isCourseQuiz && (
        <>
          <label className="flex items-start gap-3 rounded-md border p-3 sm:col-span-3">
            <Switch
              checked={value.is_required}
              onCheckedChange={(checked) => set({ is_required: checked })}
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">{t('quiz.requiredLabel')}</span>
              <span className="block text-xs text-muted-foreground">{t('quiz.requiredHint')}</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-md border p-3 sm:col-span-3">
            <Switch
              checked={value.is_final}
              onCheckedChange={(checked) => set({ is_final: checked })}
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">{t('quiz.finalLabel')}</span>
              <span className="block text-xs text-muted-foreground">{t('quiz.finalHint')}</span>
            </span>
          </label>
        </>
      )}
    </div>
  );
}
