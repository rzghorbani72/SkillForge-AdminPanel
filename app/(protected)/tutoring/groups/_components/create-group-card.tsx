'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringOffer } from '@/types/learning-operations';
import type { GroupFormState } from '../hooks/use-tutoring-groups';
import { GroupSlotEditor } from './group-slot-editor';

type Props = {
  offers: TutoringOffer[];
  form: GroupFormState;
  saving: boolean;
  onChange: (next: GroupFormState) => void;
  onSubmit: () => void;
};

export const CreateGroupCard = ({
  offers,
  form,
  saving,
  onChange,
  onSubmit
}: Props) => {
  const { t } = useTranslation();
  const patch = (next: Partial<GroupFormState>) =>
    onChange({ ...form, ...next });

  const canSubmit =
    Boolean(form.offer_id) &&
    form.title.trim().length > 0 &&
    Number(form.capacity) >= Number(form.min_students) &&
    form.slots.length > 0;

  return (
    <DataPanel
      title={t('tutoring.groups.createTitle')}
      subtitle={t('tutoring.groups.createSubtitle')}
    >
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="group-offer">{t('tutoring.groups.offer')}</Label>
            <Select
              value={form.offer_id}
              onValueChange={(offer_id) => patch({ offer_id })}
            >
              <SelectTrigger id="group-offer">
                <SelectValue
                  placeholder={t('tutoring.groups.offerPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {offers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {offer.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('tutoring.groups.offerHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-title">{t('tutoring.groups.name')}</Label>
            <Input
              id="group-title"
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-capacity">
              {t('tutoring.groups.capacity')}
            </Label>
            <Input
              id="group-capacity"
              type="number"
              min={1}
              dir="ltr"
              value={form.capacity}
              onChange={(e) => patch({ capacity: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-min">
              {t('tutoring.groups.minStudents')}
            </Label>
            <Input
              id="group-min"
              type="number"
              min={1}
              dir="ltr"
              value={form.min_students}
              onChange={(e) => patch({ min_students: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {t('tutoring.groups.minStudentsHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-age-min">{t('tutoring.groups.ageMin')}</Label>
            <Input
              id="group-age-min"
              type="number"
              min={3}
              dir="ltr"
              value={form.age_min}
              onChange={(e) => patch({ age_min: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-age-max">{t('tutoring.groups.ageMax')}</Label>
            <Input
              id="group-age-max"
              type="number"
              min={3}
              dir="ltr"
              value={form.age_max}
              onChange={(e) => patch({ age_max: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-term">{t('tutoring.groups.termWeeks')}</Label>
            <Input
              id="group-term"
              type="number"
              min={1}
              dir="ltr"
              value={form.term_weeks}
              onChange={(e) => patch({ term_weeks: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-visibility">
              {t('tutoring.groups.visibility')}
            </Label>
            <Select
              value={form.visibility}
              onValueChange={(value) =>
                patch({ visibility: value as GroupFormState['visibility'] })
              }
            >
              <SelectTrigger id="group-visibility">
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

          <div className="space-y-1.5">
            <Label htmlFor="group-deadline">
              {t('tutoring.groups.joinDeadline')}
            </Label>
            <Input
              id="group-deadline"
              type="date"
              dir="ltr"
              value={form.join_deadline}
              onChange={(e) => patch({ join_deadline: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {t('tutoring.groups.joinDeadlineHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-link">
              {t('tutoring.groups.meetingUrl')}
            </Label>
            <Input
              id="group-link"
              type="url"
              dir="ltr"
              placeholder="https://"
              value={form.meeting_url}
              onChange={(e) => patch({ meeting_url: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="group-description">
            {t('tutoring.groups.description')}
          </Label>
          <Textarea
            id="group-description"
            value={form.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('tutoring.groups.timetable')}</Label>
          <p className="text-xs text-muted-foreground">
            {t('tutoring.groups.timetableHint')}
          </p>
          <GroupSlotEditor
            slots={form.slots}
            onChange={(slots) => patch({ slots })}
          />
        </div>

        <Button type="submit" disabled={!canSubmit || saving}>
          {t('tutoring.groups.create')}
        </Button>
      </form>
    </DataPanel>
  );
};
