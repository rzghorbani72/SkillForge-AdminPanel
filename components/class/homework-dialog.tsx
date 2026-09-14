'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { DatePicker } from '@/components/ui/date-picker';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { ClassSession } from '@/types/learning-operations';

/** Sentinel for "the whole class" — the alternative is one meeting's id. */
const WHOLE_CLASS = 'class';

interface HomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent for a 1:1 engagement, which has no class-wide parent. */
  groupId?: string;
  sessions: ClassSession[];
  onCreated: () => void;
}

/**
 * Setting one piece of homework. The parent is chosen here rather than implied
 * by where the dialog was opened from, so a teacher can attach work to any
 * meeting without leaving the page.
 */
export function HomeworkDialog({
  open,
  onOpenChange,
  groupId,
  sessions,
  onCreated,
}: HomeworkDialogProps) {
  const { t, language } = useTranslation();
  const defaultParent = groupId ? WHOLE_CLASS : (sessions[0]?.id ?? '');
  const [parent, setParent] = useState(defaultParent);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setParent(defaultParent);
    setTitle('');
    setDescription('');
    setDueDate('');
    setMaxScore(100);
    setError(null);
  };

  const create = async () => {
    if (!title.trim() || !parent) {
      setError(t('courses.live.homeworkTitleRequired'));
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.createAssignment({
        ...(parent === WHOLE_CLASS
          ? { tutoring_group_id: groupId }
          : { tutoring_session_id: parent }),
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        max_score: maxScore,
      });
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const meetingLabel = (session: ClassSession, index: number) =>
    session.title ??
    session.Topic?.title ??
    `${t('courses.live.meeting')} ${index + 1} — ${new Intl.DateTimeFormat(language, {
      dateStyle: 'short',
    }).format(new Date(session.starts_at))}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('courses.live.addHomework')}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="homework-title">{t('courses.live.homeworkTitle')} *</Label>
            <Input id="homework-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-parent">{t('courses.live.homeworkFor')}</Label>
            <Select value={parent} onValueChange={setParent}>
              <SelectTrigger id="homework-parent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groupId ? (
                  <SelectItem value={WHOLE_CLASS}>
                    {t('courses.live.homeworkWholeClass')}
                  </SelectItem>
                ) : null}
                {sessions
                  .filter((session) => session.status !== 'CANCELLED')
                  .map((session, index) => (
                    <SelectItem key={session.id} value={session.id}>
                      {meetingLabel(session, index)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-due">{t('courses.live.homeworkDue')}</Label>
            <DatePicker
              id="homework-due"
              value={dueDate}
              onChange={(pickedValue: string) => setDueDate(pickedValue)}
            />
            <p className="text-xs text-muted-foreground">{t('courses.live.homeworkDueHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-score">{t('courses.live.homeworkMaxScore')}</Label>
            <NumberInput
              id="homework-score"
              value={maxScore}
              min={1}
              max={1000}
              onChange={(raw) => setMaxScore(Number(raw) || 100)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="homework-description">{t('courses.live.homeworkDescription')}</Label>
            <Textarea
              id="homework-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={create} disabled={isSaving}>
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
