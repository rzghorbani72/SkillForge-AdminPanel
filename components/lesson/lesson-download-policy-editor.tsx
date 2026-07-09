'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Lesson } from '@/types/api';
import type { LessonDownloadPolicy } from '@/types/learning-operations';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface LessonDownloadPolicyEditorProps {
  lesson: Lesson;
}

export function LessonDownloadPolicyEditor({
  lesson
}: LessonDownloadPolicyEditorProps) {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const [policy, setPolicy] = useState({
    allow_download_free: lesson.allow_download_free ?? false,
    allow_download_enrollment: lesson.allow_download_enrollment ?? true,
    allow_download_subscription: lesson.allow_download_subscription ?? true,
    allow_download_tutoring: lesson.allow_download_tutoring ?? true
  });
  const [saving, setSaving] = useState(false);
  const [savedPolicy, setSavedPolicy] = useState<LessonDownloadPolicy | null>(
    null
  );

  useEffect(() => {
    setPolicy({
      allow_download_free: lesson.allow_download_free ?? false,
      allow_download_enrollment: lesson.allow_download_enrollment ?? true,
      allow_download_subscription: lesson.allow_download_subscription ?? true,
      allow_download_tutoring: lesson.allow_download_tutoring ?? true
    });
  }, [lesson]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await apiClient.updateLessonDownloadPolicy(
        lesson.id,
        policy
      );
      setSavedPolicy(updated);
      setPolicy({
        allow_download_free: updated.allow_download_free,
        allow_download_enrollment: updated.allow_download_enrollment,
        allow_download_subscription: updated.allow_download_subscription,
        allow_download_tutoring: updated.allow_download_tutoring
      });
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle>{t('downloadPolicy.title')}</CardTitle>
        <CardDescription>{t('downloadPolicy.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(
          [
            ['allow_download_free', 'downloadPolicy.free'],
            ['allow_download_enrollment', 'downloadPolicy.enrollment'],
            ['allow_download_subscription', 'downloadPolicy.subscription'],
            ['allow_download_tutoring', 'downloadPolicy.tutoring']
          ] as const
        ).map(([key, labelKey]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 rounded-lg border p-3"
          >
            <Label htmlFor={key}>{t(labelKey)}</Label>
            <Switch
              id={key}
              checked={policy[key]}
              onCheckedChange={(checked) =>
                setPolicy((prev) => ({ ...prev, [key]: checked }))
              }
            />
          </div>
        ))}
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? t('common.saving') : t('downloadPolicy.save')}
        </Button>
        {savedPolicy && (
          <p className="text-xs text-muted-foreground" role="status">
            {t('downloadPolicy.saved')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
