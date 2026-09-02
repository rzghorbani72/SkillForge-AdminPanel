'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n/hooks';
import ScheduleBuilder from './schedule-builder';

interface CreateClassSheetProps {
  offerId: string;
  courseTitle: string;
  onCreated: () => void;
  /** Renders the trigger as the empty-state call to action instead of a toolbar button. */
  variant?: 'toolbar' | 'cta';
}

/**
 * Creating a class is an action, not the page. Keeping the long timetable form
 * in a side panel leaves the classes a teacher already runs as the thing they
 * see first, instead of scrolling past an empty form every visit.
 */
export function CreateClassSheet({
  offerId,
  courseTitle,
  onCreated,
  variant = 'toolbar'
}: CreateClassSheetProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size={variant === 'cta' ? 'default' : 'sm'}
          variant={variant === 'cta' ? 'default' : 'outline'}
        >
          <Plus className="me-1.5 h-4 w-4" />
          {t('courses.live.createClass')}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="text-start">
          <SheetTitle>{t('courses.live.schedule')}</SheetTitle>
          <SheetDescription>{t('courses.live.scheduleHint')}</SheetDescription>
        </SheetHeader>
        <div className="mt-5">
          <ScheduleBuilder
            offerId={offerId}
            courseTitle={courseTitle}
            onCreated={() => {
              setOpen(false);
              onCreated();
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
