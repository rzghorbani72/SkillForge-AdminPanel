'use client';

import { useState } from 'react';
import { EyeOff, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCourseWorkspace } from './course-workspace-context';

/**
 * Publishing is safe and reversible, so it fires straight away. Unpublishing
 * hides a live page from every visitor, so it asks first.
 */
export function CoursePublishButton() {
  const { t } = useTranslation();
  const { course, refresh } = useCourseWorkspace();
  const [saving, setSaving] = useState(false);

  if (!course) return null;
  const published = course.is_published;

  const setPublished = async (next: boolean) => {
    setSaving(true);
    try {
      await apiClient.updateCourse(course.id, { published: next });
      await refresh();
      toast.success(
        next
          ? t('courseDetail.publishedToast')
          : t('courseDetail.unpublishedToast')
      );
    } catch {
      toast.error(t('courseDetail.publishFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (!published) {
    return (
      <Button size="sm" disabled={saving} onClick={() => setPublished(true)}>
        <Globe className="me-1.5 h-3.5 w-3.5" />
        {t('courseDetail.publish')}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="secondary" disabled={saving}>
          <EyeOff className="me-1.5 h-3.5 w-3.5" />
          {t('courseDetail.unpublish')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('courseDetail.unpublishConfirmTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('courseDetail.unpublishConfirmDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => setPublished(false)}>
            {t('courseDetail.unpublish')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
