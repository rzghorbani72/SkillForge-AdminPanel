'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  StudentProfileSearchCombobox,
  TutoringSessionSearchCombobox
} from '@/components/entity-search';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringAttendanceStatus } from '@/types/learning-operations';

interface AttendanceFormState {
  session_id: string;
  profile_id: string;
  status: TutoringAttendanceStatus;
}

interface MarkAttendanceCardProps {
  form: AttendanceFormState;
  onSessionIdChange: (sessionId: string) => void;
  onProfileIdChange: (profileId: string) => void;
  onStatusChange: (status: TutoringAttendanceStatus) => void;
  saving: boolean;
  onSubmit: () => void;
}

export function MarkAttendanceCard({
  form,
  onSessionIdChange,
  onProfileIdChange,
  onStatusChange,
  saving,
  onSubmit
}: MarkAttendanceCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tutoring.markAttendance')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="attendanceSession">{t('tutoring.sessionId')}</Label>
          <TutoringSessionSearchCombobox
            id="attendanceSession"
            value={form.session_id}
            onValueChange={onSessionIdChange}
            placeholder={t('entitySearch.searchPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attendanceProfile">{t('tutoring.profileId')}</Label>
          <StudentProfileSearchCombobox
            id="attendanceProfile"
            value={form.profile_id}
            onValueChange={onProfileIdChange}
            placeholder={t('entitySearch.searchPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('tutoring.attendanceStatus')}</Label>
          <Select
            value={form.status}
            onValueChange={(value) =>
              onStatusChange(value as TutoringAttendanceStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRESENT">
                {t('tutoring.status.PRESENT')}
              </SelectItem>
              <SelectItem value="JOINED">
                {t('tutoring.status.JOINED')}
              </SelectItem>
              <SelectItem value="ABSENT">
                {t('tutoring.status.ABSENT')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => void onSubmit()} disabled={saving}>
          {t('tutoring.saveAttendance')}
        </Button>
      </CardContent>
    </Card>
  );
}
