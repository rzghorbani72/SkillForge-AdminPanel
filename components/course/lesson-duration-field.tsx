'use client';

import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';
import { toEnglishDigits, toPersianDigits } from '@/lib/phone-utils';
import { cn } from '@/lib/utils';
import { durationToSeconds, hasTimedMedia } from './course-drafts';
import type { LessonDraft } from './course-drafts';

interface LessonDurationFieldProps {
  lesson: LessonDraft;
  onChange: (duration: string) => void;
}

/**
 * A video or audio lesson takes its length from the file, so the manager never
 * types (or mistypes) it. Everything else — and any file the browser could not
 * measure — stays hand-editable so a length is always recoverable.
 */
export function LessonDurationField({
  lesson,
  onChange
}: LessonDurationFieldProps) {
  const { t, language } = useTranslation();
  const isFa = language === 'fa';
  const fromMedia =
    hasTimedMedia(lesson) && durationToSeconds(lesson.duration) > 0;
  const value = isFa ? toPersianDigits(lesson.duration) : lesson.duration;

  return (
    <div className="w-[8.75rem] space-y-1">
      <Label className="flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3 text-muted-foreground" aria-hidden />
        {t('courses.lessonDuration')}
      </Label>
      <Input
        value={value}
        readOnly={fromMedia}
        tabIndex={fromMedia ? -1 : undefined}
        onChange={(e) =>
          onChange(toEnglishDigits(e.target.value).replace(/[^\d:]/g, ''))
        }
        placeholder={isFa ? toPersianDigits('00:00') : '00:00'}
        inputMode="numeric"
        aria-describedby={
          fromMedia ? `duration-hint-${lesson.clientKey}` : undefined
        }
        className={cn(
          'h-8 text-center text-sm tabular-nums',
          fromMedia && 'cursor-default bg-muted text-muted-foreground'
        )}
      />
      {fromMedia && (
        <p
          id={`duration-hint-${lesson.clientKey}`}
          className="text-[11px] leading-snug text-muted-foreground"
        >
          {t('courses.lessonDurationAuto')}
        </p>
      )}
    </div>
  );
}
