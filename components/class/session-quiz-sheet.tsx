'use client';

import { ListChecks } from 'lucide-react';

import { QuizBuilder } from '@/components/quiz/quiz-builder';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n/hooks';

/** The quiz students take right after one meeting; it opens when the meeting starts. */
export function SessionQuizSheet({ sessionId }: { sessionId: string }) {
  const { t } = useTranslation();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <ListChecks className="h-4 w-4" />
          {t('quiz.sessionQuiz')}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{t('quiz.sessionQuiz')}</SheetTitle>
          <SheetDescription>{t('quiz.sessionQuizHint')}</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <QuizBuilder parent={{ kind: 'session', id: sessionId }} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
