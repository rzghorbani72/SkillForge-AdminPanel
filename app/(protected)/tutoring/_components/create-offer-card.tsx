'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import {
  CourseSearchCombobox,
  TeacherProfileSearchCombobox
} from '@/components/entity-search';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OfferFormState } from '../hooks/use-tutoring-offers';

interface CreateOfferCardProps {
  form: OfferFormState;
  onChange: (next: OfferFormState) => void;
  saving: boolean;
  onSubmit: () => void;
}

export function CreateOfferCard({
  form,
  onChange,
  saving,
  onSubmit
}: CreateOfferCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tutoring.createOffer')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>{t('tutoring.course')}</Label>
          <CourseSearchCombobox
            value={form.course_id}
            onValueChange={(value) => onChange({ ...form, course_id: value })}
            placeholder={t('tutoring.selectCourse')}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('tutoring.tutorProfileId')}</Label>
          <TeacherProfileSearchCombobox
            value={form.tutor_profile_id}
            onValueChange={(value) =>
              onChange({ ...form, tutor_profile_id: value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offerTitle">{t('tutoring.offerTitle')}</Label>
          <Input
            id="offerTitle"
            value={form.title}
            onChange={(event) =>
              onChange({ ...form, title: event.target.value })
            }
            placeholder={t('tutoring.offerTitlePlaceholder')}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="offerPrice">{t('tutoring.offerPrice')}</Label>
            <NumberInput
              id="offerPrice"
              value={form.price}
              onChange={(raw) => onChange({ ...form, price: raw })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offerDuration">
              {t('tutoring.offerDurationDays')}
            </Label>
            <NumberInput
              id="offerDuration"
              value={form.duration_days}
              onChange={(raw) => onChange({ ...form, duration_days: raw })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="offerSessions">
            {t('tutoring.offerSessionsOptional')}
          </Label>
          <NumberInput
            id="offerSessions"
            value={form.sessions_included}
            onChange={(raw) => onChange({ ...form, sessions_included: raw })}
          />
        </div>
        <Button
          onClick={() => void onSubmit()}
          disabled={
            saving || !form.course_id || !form.tutor_profile_id || !form.title
          }
        >
          {t('tutoring.createOffer')}
        </Button>
      </CardContent>
    </Card>
  );
}
