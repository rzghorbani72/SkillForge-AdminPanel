'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { useTranslation } from '@/lib/i18n/hooks';

interface Props {
  error: string | null;
  onCreate: (title: string, passingScore: number) => Promise<boolean>;
}

export function QuizCreateForm({ error, onCreate }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(0);

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
        <Button onClick={() => onCreate(title, passingScore)} disabled={title.trim().length < 2}>
          {t('quiz.create')}
        </Button>
      </CardContent>
    </Card>
  );
}
