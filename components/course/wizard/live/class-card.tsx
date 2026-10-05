'use client';

import { useState } from 'react';
import { Settings2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EditClassSheet } from '@/app/(protected)/courses/[course_id]/live/_components/edit-class-sheet';
import { Note } from '@/components/shared/note';
import { FieldError } from '@/components/shared/field-label';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { ClassDaysField } from './class-days-field';
import { ClassScheduleFields } from './class-schedule-fields';
import { ClassSessionsPreview } from './class-sessions-preview';
import type { ClassScheduleApi } from './use-class-schedules';

type ClassCardProps = {
  item: ClassScheduleApi;
  courseId: string;
  coursePublished: boolean;
  /** Only a class not yet saved can be removed; a saved one is cancelled from "Manage class". */
  onRemove: (() => void) | null;
  onManaged: () => void;
};

/** One class: its name, timetable and the dates that timetable produces. */
export function ClassCard({
  item,
  courseId,
  coursePublished,
  onRemove,
  onManaged,
}: ClassCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [managing, setManaging] = useState(false);
  const groupId = item.schedule.groupId;

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <header className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 font-extrabold text-primary">
          {formatNumber(item.index + 1)}
        </span>
        <Input
          aria-label={t('liveWizard.className')}
          value={item.schedule.title}
          maxLength={255}
          placeholder={t('liveWizard.classNamePlaceholder')}
          onChange={(event) => item.update({ title: event.target.value })}
          className="h-10 max-w-md text-base font-bold"
        />
        {groupId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ms-auto shrink-0 gap-1.5"
            onClick={() => setManaging(true)}
          >
            <Settings2 className="h-4 w-4" aria-hidden />
            {t('liveWizard.manageClass')}
          </Button>
        ) : null}
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ms-auto shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={t('liveWizard.removeClass')}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
      </header>
      <FieldError messageKey={item.shownErrors.title} />
      {item.locked ? <Note tone="warn">{t('liveWizard.scheduleLocked')}</Note> : null}
      <ClassScheduleFields item={item} />
      <ClassDaysField item={item} />
      <ClassSessionsPreview item={item} />
      {managing && groupId ? (
        <EditClassSheet
          courseId={courseId}
          coursePublished={coursePublished}
          groupId={groupId}
          onOpenChange={setManaging}
          onChanged={onManaged}
        />
      ) : null}
    </Card>
  );
}
