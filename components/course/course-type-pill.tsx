'use client';

import { PlayCircle, Radio } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseType } from './course-drafts';

/**
 * Live or recorded, at a glance. The two types behave differently everywhere
 * (a live course sells seats, a recorded one sells access), so the manager has
 * to be able to tell them apart without opening the course.
 */
export function CourseTypePill({
  type = 'OFFLINE',
  className = '',
}: {
  type?: CourseType;
  className?: string;
}) {
  const { t } = useTranslation();
  const isLive = type === 'LIVE';
  const Icon = isLive ? Radio : PlayCircle;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        isLive
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-sky-200 bg-sky-50 text-sky-700'
      } ${className}`}
    >
      <Icon className="h-3 w-3" />
      {t(isLive ? 'courses.typeLiveTitle' : 'courses.typeOfflineTitle')}
    </span>
  );
}
