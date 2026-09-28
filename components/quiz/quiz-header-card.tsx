'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';
import { QuizSettingsFields } from './quiz-settings-fields';
import type { Quiz, QuizSettings } from './quiz-types';

export interface QuizDetails extends QuizSettings {
  title: string;
  description?: string;
}

interface Props {
  quiz: Quiz;
  onTogglePublish: () => Promise<boolean>;
  onSave: (details: QuizDetails) => Promise<boolean>;
  children: React.ReactNode;
}

export function QuizHeaderCard({ quiz, onTogglePublish, onSave, children }: Props) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description ?? '');
  const [settings, setSettings] = useState<QuizSettings>(quiz);
  const bankSize = quiz.Question.length;
  const perAttempt = Math.min(quiz.questions_per_attempt ?? bankSize, bankSize);

  const save = async () => {
    const ok = await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      pass_percent: settings.pass_percent,
      questions_per_attempt: settings.questions_per_attempt,
      max_attempts: settings.max_attempts,
      is_required: settings.is_required,
      is_final: settings.is_final,
    });
    if (ok) setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{quiz.title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('quiz.summaryBank', {
              bank: bankSize,
              perAttempt,
              pass: quiz.pass_percent,
            })}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quiz.is_required && <Badge variant="secondary">{t('quiz.requiredBadge')}</Badge>}
            {quiz.is_final && <Badge variant="secondary">{t('quiz.finalBadge')}</Badge>}
            <Badge variant="outline">
              {quiz.max_attempts == null
                ? t('quiz.unlimitedAttempts')
                : t('quiz.attemptsAllowed', { count: quiz.max_attempts })}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={quiz.is_published ? 'default' : 'outline'}>
            {quiz.is_published ? t('courses.published') : t('courses.draft')}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing((v) => !v)}
            aria-label={t('quiz.editQuiz')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={quiz.is_published ? 'outline' : 'default'}
            onClick={onTogglePublish}
          >
            {quiz.is_published ? t('quiz.unpublish') : t('quiz.publish')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && (
          <div className="grid gap-4 rounded-md border p-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('common.title')}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <QuizSettingsFields
                value={settings}
                onChange={setSettings}
                bankSize={bankSize}
                isCourseQuiz={quiz.tutoring_session_id == null}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t('quiz.description')}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button size="sm" onClick={save} disabled={title.trim().length < 2}>
                {t('quiz.saveChanges')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
