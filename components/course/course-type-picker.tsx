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

/** Recorded or live. Picked once, before the create wizard opens. */
export function CourseTypePicker({
  value,
  onChange,
}: {
  value?: CourseType;
  onChange: (type: CourseType) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {COURSE_TYPES.map(({ value: type, titleKey, hintKey, icon: Icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          aria-pressed={value === type}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 text-start transition-colors',
            value === type ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent',
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
