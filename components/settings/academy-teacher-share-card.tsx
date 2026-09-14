'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { Save } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { fromPercent, toPercent } from '@/components/platform/pricing/pricing-helpers';

type Props = {
  teacherShareRate?: number;
  onSaved: () => void;
};

export function AcademyTeacherShareCard({ teacherShareRate, onSaved }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState(String(toPercent(teacherShareRate ?? 0.7)));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateAcademy({
        teacher_share_rate: fromPercent(Number(value)),
      });
      ErrorHandler.showSuccess(t('settings.teacherShareUpdatedSuccess'));
      onSaved();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.teacherShareTitle')}</CardTitle>
        <CardDescription>{t('settings.teacherShareDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end gap-3">
        <div className="max-w-[160px] flex-1 space-y-2">
          <Label htmlFor="teacher-share-rate">{t('settings.teacherShareLabel')}</Label>
          <NumberInput id="teacher-share-rate" allowDecimal value={value} onChange={setValue} />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="me-1.5 h-3.5 w-3.5" />
          {saving ? t('common.saving') : t('stores.saveChanges')}
        </Button>
      </CardContent>
    </Card>
  );
}
