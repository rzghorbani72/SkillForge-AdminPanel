'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ClassSellingFields } from '@/components/class/class-selling-fields';
import { ClassInviteBlock } from '@/components/class/class-invite-block';
import { ClassPlanSeatsNote } from '@/components/class/class-plan-seats-note';
import { GroupActionsCard } from '@/components/class/group-actions-card';
import { GroupSlotEditor } from '@/app/(protected)/tutoring/groups/_components/group-slot-editor';
import { useClassDetail } from '@/hooks/use-class-detail';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringGroup, TutoringGroupSlot } from '@/types/learning-operations';
import { ClassCancelledNotice } from './class-cancelled-notice';
import { ClassSettingsFields } from './class-settings-fields';
import { useClassSettings } from './use-class-settings';

type ClassSettingsBodyProps = {
  courseId: string;
  coursePublished: boolean;
  group: TutoringGroup;
  detail: ReturnType<typeof useClassDetail>;
  onChanged: () => void;
};

function ClassTimetableBlock({
  canEditSchedule,
  slots,
  onChange,
}: {
  canEditSchedule: boolean;
  slots: TutoringGroupSlot[];
  onChange: (slots: TutoringGroupSlot[]) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <Label>{t('tutoring.groups.timetable')}</Label>
      {canEditSchedule ? (
        <>
          <p className="text-xs text-muted-foreground">{t('tutoring.groups.timetableHint')}</p>
          <GroupSlotEditor slots={slots} onChange={onChange} />
        </>
      ) : (
        <p className="text-xs text-muted-foreground">{t('tutoring.groups.timetableLockedHint')}</p>
      )}
    </div>
  );
}

function ClassSettingsFooter({
  isDraft,
  coursePublished,
  busy,
  saving,
  onPublish,
  onSave,
}: {
  isDraft: boolean;
  coursePublished: boolean;
  busy: boolean;
  saving: boolean;
  onPublish: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="shrink-0 space-y-2 border-t bg-background p-4 sm:px-6">
      {isDraft && !coursePublished && (
        <p className="text-xs text-muted-foreground">{t('courses.live.publishCourseFirst')}</p>
      )}
      <div className="flex gap-2">
        {isDraft && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={busy || saving || !coursePublished}
            onClick={onPublish}
          >
            {busy || saving ? t('common.saving') : t('courses.live.publishClass')}
          </Button>
        )}
        <Button type="button" className="flex-1" disabled={busy || saving} onClick={onSave}>
          {saving ? t('common.saving') : t('common.saveChanges')}
        </Button>
      </div>
    </div>
  );
}

function ClassSettingsSections({
  courseId,
  coursePublished,
  group,
  detail,
  onChanged,
}: ClassSettingsBodyProps) {
  const { t } = useTranslation();
  const settings = useClassSettings(
    group,
    { update: detail.update, replaceSlots: detail.replaceSlots, publish: detail.publish },
    onChanged,
  );

  return (
    <>
      <div className="beautiful-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
        <ClassCancelledNotice
          group={group}
          busy={detail.busy}
          onReopen={async () => {
            const ok = await detail.reopen();
            if (ok) onChanged();
            return ok;
          }}
        />
        <ClassSettingsFields
          draft={settings.draft}
          group={group}
          canEditSchedule={settings.canEditSchedule}
          patch={settings.patch}
        />
        <ClassPlanSeatsNote />
        <ClassSellingFields
          idPrefix="edit-group"
          capacity={Number(settings.draft.capacity) || 1}
          seatPrice={settings.draft.seatPrice}
          offerPrice={group.Offer?.price}
          wholeClassBooking={settings.draft.wholeClassBooking}
          seatsHeld={group.seats_held}
          onSeatPriceChange={(seatPrice) => settings.patch({ seatPrice })}
          onWholeClassBookingChange={(wholeClassBooking) => settings.patch({ wholeClassBooking })}
        />
        <ClassInviteBlock
          joinCode={group.join_code}
          coursePublished={coursePublished}
          classStatus={group.status}
        />
        <ClassTimetableBlock
          canEditSchedule={settings.canEditSchedule}
          slots={settings.slots}
          onChange={settings.setSlots}
        />
        <GroupActionsCard
          group={group}
          busy={detail.busy}
          onUpdateBackupLink={(url) =>
            void detail.updateBackupLink(url).then((ok) => ok && onChanged())
          }
          onUpdateLink={(url, notify, regenerate) =>
            void detail.updateLink(url, notify, regenerate).then((ok) => ok && onChanged())
          }
          onAnnounce={(body, sms) => void detail.announce(body, sms)}
          onConfirm={() => void detail.confirm().then((ok) => ok && onChanged())}
          onCancel={async (payload) => {
            const ok = await detail.cancel(payload);
            if (ok) onChanged();
            return ok;
          }}
        />
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/courses/${courseId}/live/${group.id}`}>
            <ExternalLink className="me-1.5 h-4 w-4" />
            {t('tutoring.groups.openFullPage')}
          </Link>
        </Button>
      </div>
      <ClassSettingsFooter
        isDraft={group.status === 'DRAFT'}
        coursePublished={coursePublished}
        busy={detail.busy}
        saving={settings.saving}
        onPublish={() => void settings.doPublish()}
        onSave={() => void settings.doSave()}
      />
    </>
  );
}

/**
 * Mounted only once its class has loaded, keyed by the class id — so every
 * field starts from the class's own data with no effect needed to sync it in
 * after the fetch.
 */
export function ClassSettingsBody(props: ClassSettingsBodyProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ClassSettingsSections {...props} />
    </div>
  );
}
