'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useTranslation } from '@/lib/i18n/hooks';

interface MessageGradeProps {
  messageId: string;
  score: number | null;
  onGraded: () => Promise<void> | void;
}

/** Grade (0-100) for a file a student handed in through the teacher chat. */
export function MessageGrade({ messageId, score, onGraded }: MessageGradeProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(score == null ? '' : String(score));
  const [saving, setSaving] = useState(false);
  const parsed = Number(value);
  const valid = value !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 100;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await apiClient.gradeDiscussionMessage(messageId, parsed);
      toast.success(t('discussion.gradeSaved'));
      await onGraded();
    } catch (e) {
      toast.error(apiErrorMessage(e, t('discussion.gradeFailed')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-2 border-t pt-2">
      <span className="text-xs opacity-80">{t('discussion.gradeLabel')}</span>
      <NumberInput
        className="h-8 w-20 bg-background text-foreground"
        value={value}
        onChange={(raw) => setValue(String(raw))}
        aria-label={t('discussion.gradeLabel')}
      />
      <Button type="button" size="sm" className="h-8" onClick={save} disabled={!valid || saving}>
        {t(score == null ? 'discussion.gradeSave' : 'discussion.gradeUpdate')}
      </Button>
    </div>
  );
}
