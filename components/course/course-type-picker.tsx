'use client';

import { PlayCircle, Radio } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { CourseType } from './course-drafts';

const COURSE_TYPES: {
  value: CourseType;
  titleKey: string;
  hintKey: string;
  icon: typeof Radio;
}[] = [
  {
    value: 'OFFLINE',
    titleKey: 'courses.typeOfflineTitle',
    hintKey: 'courses.typeOfflineHint',
    icon: PlayCircle,
  },
  {
    value: 'LIVE',
    titleKey: 'courses.typeLiveTitle',
    hintKey: 'courses.typeLiveHint',
    icon: Radio,
  },
];

/**
 * Recorded or live. The choice decides how the whole course is built, so it is
 * made once at creation and shown read-only afterwards.
 */
export function CourseTypePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: CourseType;
  onChange: (type: CourseType) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {COURSE_TYPES.map(({ value: type, titleKey, hintKey, icon: Icon }) => (
        <button
          key={type}
          type="button"
          disabled={disabled}
          onClick={() => onChange(type)}
          aria-pressed={value === type}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 text-start transition-colors',
            value === type ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span>
            <span className="block text-sm font-medium">{t(titleKey)}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{t(hintKey)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
