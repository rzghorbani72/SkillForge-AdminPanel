'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { GroupActionsCard } from '@/components/class/group-actions-card';
import { GroupStatusBadge } from '@/components/class/group-status-badge';
import { GroupSlotEditor } from '@/app/(protected)/tutoring/groups/_components/group-slot-editor';
import { useClassDetail } from '@/hooks/use-class-detail';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  TutoringGroup,
  TutoringGroupSlot,
  TutoringGroupVisibility
} from '@/types/learning-operations';

/** The timetable is only a proposal until the class fills and is confirmed. */
const EDITABLE_SCHEDULE_STATUSES = ['DRAFT', 'WAITING'];

interface EditClassSheetProps {
  courseId: string;
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
  groupId,
  onOpenChange,
  onChanged
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
          <SheetDescription>
            {t('tutoring.groups.editSheetHint')}
          </SheetDescription>
        </SheetHeader>

        {detail.loading || !detail.group ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ClassSettingsBody
            key={detail.group.id}
            courseId={courseId}
            group={detail.group}
            busy={detail.busy}
            update={detail.update}
            replaceSlots={detail.replaceSlots}
            publish={detail.publish}
            updateLink={detail.updateLink}
            announce={detail.announce}
            confirm={detail.confirm}
            cancel={detail.cancel}
            onChanged={onChanged}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

type ClassSettingsBodyProps = {
  courseId: string;
  group: TutoringGroup;
  busy: boolean;
  update: ReturnType<typeof useClassDetail>['update'];
  replaceSlots: ReturnType<typeof useClassDetail>['replaceSlots'];
  publish: ReturnType<typeof useClassDetail>['publish'];
  updateLink: ReturnType<typeof useClassDetail>['updateLink'];
  announce: ReturnType<typeof useClassDetail>['announce'];
  confirm: ReturnType<typeof useClassDetail>['confirm'];
  cancel: ReturnType<typeof useClassDetail>['cancel'];
  onChanged: () => void;
};

/**
 * Mounted only once its class has loaded, keyed by the class id — so every
 * field starts from the class's own data with no effect needed to sync it in
 * after the fetch.
 */
function ClassSettingsBody({
  courseId,
  group,
  busy,
  update,
  replaceSlots,
  publish,
  updateLink,
  announce,
  confirm,
  cancel,
  onChanged
}: ClassSettingsBodyProps) {
  const { t } = useTranslation();

  const [title, setTitle] = useState(group.title);
  const [description, setDescription] = useState(group.description ?? '');
  const [capacity, setCapacity] = useState(String(group.capacity));
  const [minStudents, setMinStudents] = useState(String(group.min_students));
  const [ageMin, setAgeMin] = useState(
    group.age_min ? String(group.age_min) : ''
  );
  const [ageMax, setAgeMax] = useState(
    group.age_max ? String(group.age_max) : ''
  );
  const [termWeeks, setTermWeeks] = useState(String(group.term_weeks));
  const [visibility, setVisibility] = useState<TutoringGroupVisibility>(
    group.visibility
  );
  const [joinDeadline, setJoinDeadline] = useState(
    group.join_deadline ? group.join_deadline.slice(0, 10) : ''
  );
  const [slots, setSlots] = useState<TutoringGroupSlot[]>(group.Slots ?? []);
  const [saving, setSaving] = useState(false);

  const canEditSchedule = EDITABLE_SCHEDULE_STATUSES.includes(group.status);

  // One save writes every field, the timetable included — a manager who edits
  // a slot and presses "save changes" must never lose it.
  const saveAll = async (): Promise<boolean> => {
    setSaving(true);
    try {
      const settingsOk = await update({
        title: title.trim(),
        description: description.trim() || undefined,
        capacity: Number(capacity) || undefined,
        min_students: Number(minStudents) || undefined,
        age_min: ageMin ? Number(ageMin) : undefined,
        age_max: ageMax ? Number(ageMax) : undefined,
        term_weeks: Number(termWeeks) || undefined,
        visibility,
        join_deadline: joinDeadline
          ? new Date(joinDeadline).toISOString()
          : undefined
      });
      if (!settingsOk) return false;
      if (canEditSchedule && !(await replaceSlots(slots))) return false;
      onChanged();
      return true;
    } finally {
      setSaving(false);
    }
  };

  const doSave = async () => {
    if (await saveAll()) toast.success(t('courseDetail.settingsSaved'));
  };

  const doPublish = async () => {
    if (!(await saveAll())) return;
    if (await publish()) {
      toast.success(t('courses.live.classPublished'));
      onChanged();
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="space-y-4 rounded-lg border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-group-title">
                {t('tutoring.groups.name')}
              </Label>
              <Input
                id="edit-group-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-group-description">
                {t('tutoring.groups.description')}
              </Label>
              <Textarea
                id="edit-group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-group-capacity">
                {t('tutoring.groups.capacity')}
              </Label>
              <NumberInput
                id="edit-group-capacity"
                value={capacity}
                min={1}
                onChange={setCapacity}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-group-min">
                {t('tutoring.groups.minStudents')}
              </Label>
              <NumberInput
                id="edit-group-min"
                value={minStudents}
                min={1}
                onChange={setMinStudents}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-group-age-min">
                {t('tutoring.groups.ageMin')}
              </Label>
              <NumberInput
                id="edit-group-age-min"
                value={ageMin}
                min={3}
                onChange={setAgeMin}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-group-age-max">
                {t('tutoring.groups.ageMax')}
              </Label>
              <NumberInput
                id="edit-group-age-max"
                value={ageMax}
                min={3}
                onChange={setAgeMax}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-group-term">
                {t('tutoring.groups.termWeeks')}
              </Label>
              <NumberInput
                id="edit-group-term"
                value={termWeeks}
                min={1}
                onChange={setTermWeeks}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-group-visibility">
                {t('tutoring.groups.visibility')}
              </Label>
              <Select
                value={visibility}
                onValueChange={(value) =>
                  setVisibility(value as TutoringGroupVisibility)
                }
              >
                <SelectTrigger id="edit-group-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">
                    {t('tutoring.groups.visibilityPublic')}
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    {t('tutoring.groups.visibilityPrivate')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-group-deadline">
                {t('tutoring.groups.joinDeadline')}
              </Label>
              <DatePicker
                id="edit-group-deadline"
                value={joinDeadline}
                onChange={setJoinDeadline}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border p-4">
          <Label>{t('tutoring.groups.timetable')}</Label>
          {canEditSchedule ? (
            <>
              <p className="text-xs text-muted-foreground">
                {t('tutoring.groups.timetableHint')}
              </p>
              <GroupSlotEditor slots={slots} onChange={setSlots} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('tutoring.groups.timetableLockedHint')}
            </p>
          )}
        </div>

        <GroupActionsCard
          group={group}
          busy={busy}
          onUpdateLink={(url, notify, regenerate) =>
            void updateLink(url, notify, regenerate).then(
              (ok) => ok && onChanged()
            )
          }
          onAnnounce={(body, sms) => void announce(body, sms)}
          onConfirm={() => void confirm().then((ok) => ok && onChanged())}
          onCancel={(reason) =>
            void cancel(reason).then((ok) => ok && onChanged())
          }
        />

        <Button variant="outline" className="w-full" asChild>
          <Link href={`/courses/${courseId}/live/${group.id}`}>
            <ExternalLink className="me-1.5 h-4 w-4" />
            {t('tutoring.groups.openFullPage')}
          </Link>
        </Button>
      </div>

      <div className="flex shrink-0 gap-2 border-t bg-background p-4 sm:px-6">
        {group.status === 'DRAFT' && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={busy || saving}
            onClick={() => void doPublish()}
          >
            {busy || saving
              ? t('common.saving')
              : t('courses.live.publishClass')}
          </Button>
        )}
        <Button
          type="button"
          className="flex-1"
          disabled={busy || saving}
          onClick={() => void doSave()}
        >
          {saving ? t('common.saving') : t('common.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
