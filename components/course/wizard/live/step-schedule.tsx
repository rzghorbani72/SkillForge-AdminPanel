'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { ClassCard } from './class-card';
import type { LiveClassDraftApi } from './use-live-class-draft';

/** Every class of the course, each with its own name, timetable and registration close. */
export function StepSchedule({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const canRemove = live.classes.length > 1;

  return (
    <div className="flex flex-col gap-3">
      {live.classes.map((item) => (
        <ClassCard
          key={item.schedule.key}
          item={item}
          courseId={live.courseId}
          coursePublished={Boolean(live.course?.is_published)}
          onManaged={() => void live.reload()}
          onRemove={
            canRemove && item.schedule.groupId === null
              ? () => live.removeClass(item.schedule.key)
              : null
          }
        />
      ))}
      <Button
        type="button"
        variant="outline"
        className="h-11 gap-2 border-dashed text-muted-foreground hover:text-foreground"
        onClick={() => live.addClass()}
      >
        <Plus className="h-4 w-4" aria-hidden />
        {t('liveWizard.addClass')}
      </Button>
    </div>
  );
}
