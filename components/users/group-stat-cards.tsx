'use client';

import { useTranslation } from '@/lib/i18n/hooks';

type GroupStatCardsProps = {
  members: number;
  courses: number;
  lessons: number;
};

/**
 * The three numbers that say what a group actually does: who is in it, and how
 * much content it unlocks. Lesson grants are shown separately from course
 * grants because they are a narrower, per-lesson unlock.
 */
export function GroupStatCards({
  members,
  courses,
  lessons
}: GroupStatCardsProps) {
  const { t } = useTranslation();

  const stats = [
    { label: t('users.groupMembers'), value: members },
    { label: t('users.groupCourseAccess'), value: courses },
    { label: t('users.groupLessonAccess'), value: lessons }
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-muted/20 p-2 text-center sm:p-3"
        >
          <div className="text-base font-bold leading-none sm:text-[18px]">
            {stat.value.toLocaleString('fa-IR')}
          </div>
          <div className="mt-1 text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
