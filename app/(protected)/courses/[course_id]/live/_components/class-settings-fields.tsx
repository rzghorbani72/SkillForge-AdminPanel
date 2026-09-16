'use client';

import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringGroup } from '@/types/learning-operations';
import type { ClassSettingsDraft } from './use-class-settings';

type FieldsProps = {
  draft: ClassSettingsDraft;
  seatsTaken: number;
  patch: (partial: Partial<ClassSettingsDraft>) => void;
};

function ClassBasicsFields({ draft, patch }: Omit<FieldsProps, 'seatsTaken'>) {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="edit-group-title">{t('tutoring.groups.name')}</Label>
        <Input
          id="edit-group-title"
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="edit-group-description">{t('tutoring.groups.description_')}</Label>
        <Textarea
          id="edit-group-description"
          value={draft.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </div>
    </>
  );
}

function ClassSizeFields({ draft, seatsTaken, patch }: FieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="edit-group-capacity">{t('tutoring.groups.capacity')}</Label>
        <NumberInput
          id="edit-group-capacity"
          value={draft.capacity}
          min={Math.max(1, seatsTaken)}
          onChange={(capacity) => patch({ capacity })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-group-min">{t('tutoring.groups.minStudents')}</Label>
        <NumberInput
          id="edit-group-min"
          value={draft.minStudents}
          min={1}
          onChange={(minStudents) => patch({ minStudents })}
        />
      </div>
    </>
  );
}

function ClassTermFields({ draft, patch }: Omit<FieldsProps, 'seatsTaken'>) {
  const { t } = useTranslation();

  const setVisibility = (value: string) => {
    if (value === 'PUBLIC' || value === 'PRIVATE') patch({ visibility: value });
  };

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="edit-group-sessions">{t('courses.live.sessionCount')}</Label>
        <NumberInput
          id="edit-group-sessions"
          value={draft.sessionCount}
          min={1}
          onChange={(sessionCount) => patch({ sessionCount })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-group-visibility">{t('tutoring.groups.visibility')}</Label>
        <Select value={draft.visibility} onValueChange={setVisibility}>
          <SelectTrigger id="edit-group-visibility">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLIC">{t('tutoring.groups.visibilityPublic')}</SelectItem>
            <SelectItem value="PRIVATE">{t('tutoring.groups.visibilityPrivate')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="edit-group-deadline">{t('tutoring.groups.joinDeadline')}</Label>
        <DatePicker
          id="edit-group-deadline"
          value={draft.joinDeadline}
          onChange={(joinDeadline) => patch({ joinDeadline })}
        />
      </div>
    </>
  );
}

export function ClassSettingsFields({
  draft,
  group,
  patch,
}: {
  draft: ClassSettingsDraft;
  group: TutoringGroup;
  patch: (partial: Partial<ClassSettingsDraft>) => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ClassBasicsFields draft={draft} patch={patch} />
        <ClassSizeFields draft={draft} seatsTaken={group.seats_taken} patch={patch} />
        <ClassTermFields draft={draft} patch={patch} />
      </div>
    </div>
  );
}
