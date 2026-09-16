'use client';

import { Loader2 } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { GroupStatusBadge } from '@/components/class/group-status-badge';
import { useClassDetail } from '@/hooks/use-class-detail';
import { useTranslation } from '@/lib/i18n/hooks';
import { ClassSettingsBody } from './class-settings-body';

interface EditClassSheetProps {
  courseId: string;
  coursePublished: boolean;
  groupId: string;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

/**
 * Every setting one class has, without leaving the classroom step: what it is
 * called, its price seat, its capacity, its weekly timetable, and the actions
 * that run it day to day — up to cancelling or publishing the whole thing.
 */
export function EditClassSheet({
  courseId,
  coursePublished,
  groupId,
  onOpenChange,
  onChanged,
}: EditClassSheetProps) {
  const { t } = useTranslation();
  const detail = useClassDetail(groupId);

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
        // A toast (react-toastify) renders in its own portal outside this
        // sheet's DOM subtree, so Radix's outside-pointer-down detection
        // treats clicking the "saved" toast as an outside click and closes
        // the sheet mid-edit. Ignore interactions with anything outside that
        // isn't part of an intentional dismiss (overlay/escape still work).
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest('.Toastify')) event.preventDefault();
        }}
      >
        <SheetHeader className="px-4 pt-4 text-start sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2">
            <SheetTitle className="truncate">
              {detail.group?.title ?? t('common.loading')}
            </SheetTitle>
            {detail.group && <GroupStatusBadge status={detail.group.status} />}
          </div>
          <SheetDescription>{t('tutoring.groups.editSheetHint')}</SheetDescription>
        </SheetHeader>

        {detail.loading || !detail.group ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ClassSettingsBody
            key={detail.group.id}
            courseId={courseId}
            coursePublished={coursePublished}
            group={detail.group}
            detail={detail}
            onChanged={onChanged}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
