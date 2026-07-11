'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CourseSearchCombobox,
  StudentProfileSearchCombobox,
  TeacherProfileSearchCombobox
} from '@/components/entity-search';
import { useTranslation } from '@/lib/i18n/hooks';

interface EngagementFormState {
  course_id: string;
  student_profile_id: string;
  tutor_profile_id: string;
  ends_at: string;
}

interface CreateEngagementCardProps {
  form: EngagementFormState;
  onChange: (next: EngagementFormState) => void;
  saving: boolean;
  onSubmit: () => void;
}

export function CreateEngagementCard({
  form,
  onChange,
  saving,
  onSubmit
}: CreateEngagementCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tutoring.createEngagement')}</CardTitle>
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
          <Label htmlFor="studentProfile">
            {t('tutoring.studentProfileId')}
          </Label>
          <StudentProfileSearchCombobox
            id="studentProfile"
            value={form.student_profile_id}
            onValueChange={(value) =>
              onChange({ ...form, student_profile_id: value })
            }
            placeholder={t('entitySearch.searchPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tutorProfile">{t('tutoring.tutorProfileId')}</Label>
          <TeacherProfileSearchCombobox
            id="tutorProfile"
            value={form.tutor_profile_id}
            onValueChange={(value) =>
              onChange({ ...form, tutor_profile_id: value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">{t('tutoring.endsAtOptional')}</Label>
          <Input
            id="endsAt"
            type="datetime-local"
            value={form.ends_at}
            onChange={(event) =>
              onChange({ ...form, ends_at: event.target.value })
            }
          />
        </div>
        <Button onClick={() => void onSubmit()} disabled={saving}>
          {t('tutoring.activateEngagement')}
        </Button>
      </CardContent>
    </Card>
  );
}
