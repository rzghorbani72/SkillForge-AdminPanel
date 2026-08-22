'use client';

import { Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/phone-utils';
import type { LessonDraft } from './course-drafts';

interface LessonDurationInfoProps {
  lesson: LessonDraft;
}

/**
 * The length always comes from the uploaded file, so it is shown as a read-only
 * fact next to the player instead of a field the manager could mistype.
 */
export function LessonDurationInfo({ lesson }: LessonDurationInfoProps) {
  const { t, language } = useTranslation();
  const isFa = language === 'fa';

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {t('courses.lessonDuration')}
      </span>
      <span className="text-end">
        <span className="block text-base font-semibold tabular-nums leading-tight">
          {isFa ? toPersianDigits(lesson.duration) : lesson.duration}
        </span>
        <span className="block text-[11px] leading-snug text-muted-foreground">
          {t('courses.lessonDurationAuto')}
        </span>
      </span>
    </div>
  );
}
