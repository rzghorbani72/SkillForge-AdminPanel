'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';
import { QuizSettingsFields } from './quiz-settings-fields';
import { DEFAULT_QUIZ_SETTINGS, type QuizSettings } from './quiz-types';

interface Props {
  error: string | null;
  isLessonQuiz: boolean;
  onCreate: (title: string, settings: QuizSettings) => Promise<boolean>;
}

export function QuizCreateForm({ error, isLessonQuiz, onCreate }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(isLessonQuiz ? 'quiz.createForLesson' : 'quiz.createForSession')}</CardTitle>
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
        <QuizSettingsFields value={settings} onChange={setSettings} isLessonQuiz={isLessonQuiz} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={() => onCreate(title, settings)} disabled={title.trim().length < 2}>
          {t('quiz.create')}
        </Button>
      </CardContent>
    </Card>
  );
}
