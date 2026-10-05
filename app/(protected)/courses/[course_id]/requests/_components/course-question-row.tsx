'use client';

import { useState } from 'react';
import { Eye, EyeOff, Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { CourseQnA } from '@/types/learning-operations';

const MIN_ANSWER_LENGTH = 10;

interface CourseQuestionRowProps {
  item: CourseQnA;
  onChanged: () => Promise<void>;
}

export function CourseQuestionRow({ item, onChanged }: CourseQuestionRowProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const [answer, setAnswer] = useState(item.answer ?? '');
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      await onChanged();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setBusy(false);
    }
  };

  const status = !item.answer ? 'unanswered' : item.is_approved ? 'published' : 'hidden';

  return (
    <li className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-medium">{item.profile?.display_name ?? '—'}</p>
          <p className="whitespace-pre-line">{item.question}</p>
          <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
        </div>
        <Badge
          variant={
            status === 'unanswered' ? 'warning' : status === 'published' ? 'success' : 'muted'
          }
        >
          {t(`courseDetail.questionStatus.${status}`)}
        </Badge>
      </div>

      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t('courseDetail.questionAnswerPlaceholder')}
        rows={3}
        maxLength={2000}
        dir="rtl"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={
            busy || answer.trim().length < MIN_ANSWER_LENGTH || answer.trim() === item.answer
          }
          onClick={() =>
            void run(() => apiClient.answerCourseQnA(item.course_id, item.id, answer.trim()))
          }
        >
          <Send className="me-1.5 h-4 w-4" />
          {t(item.answer ? 'courseDetail.questionUpdateAnswer' : 'courseDetail.questionSendAnswer')}
        </Button>
        {item.answer ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              void run(() => apiClient.approveCourseQnA(item.course_id, item.id, !item.is_approved))
            }
          >
            {item.is_approved ? (
              <EyeOff className="me-1.5 h-4 w-4" />
            ) : (
              <Eye className="me-1.5 h-4 w-4" />
            )}
            {t(item.is_approved ? 'courseDetail.questionHide' : 'courseDetail.questionPublish')}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
