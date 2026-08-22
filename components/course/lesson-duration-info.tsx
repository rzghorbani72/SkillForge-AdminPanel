'use client';

import { Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/phone-utils';
import { cn } from '@/lib/utils';
import type { LessonDraft } from './course-drafts';

interface LessonDurationInfoProps {
  lesson: LessonDraft;
  className?: string;
}

/**
 * The length always comes from the uploaded file, so it is shown as a read-only
 * fact next to the player instead of a field the manager could mistype.
 */
export function LessonDurationInfo({
  lesson,
  className
}: LessonDurationInfoProps) {
  const { t, language } = useTranslation();
  const isFa = language === 'fa';

  return (
    <div className={cn('space-y-0.5', className)}>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" aria-hidden />
        {t('courses.lessonDuration')}
      </p>
      <p className="text-lg font-semibold tabular-nums leading-tight">
        {isFa ? toPersianDigits(lesson.duration) : lesson.duration}
      </p>
      <p className="text-[11px] leading-snug text-muted-foreground">
        {t('courses.lessonDurationAuto')}
      </p>
    </div>
  );
}
