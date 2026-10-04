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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiErrorMessage } from '@/lib/api-error-message';
import type { CourseDetail } from './types';

type CoursePublishButtonProps = {
  course: Pick<CourseDetail, 'id' | 'is_published' | 'course_type'>;
  onChanged: () => void | Promise<void>;
  className?: string;
};

/**
 * Publishing is safe and reversible, so it fires straight away. Unpublishing
 * hides a live page from every visitor, so it asks first. Used on the course
 * page and on every course in the list.
 */
export function CoursePublishButton({ course, onChanged, className }: CoursePublishButtonProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const published = course.is_published;

  const setPublished = async (next: boolean) => {
    setSaving(true);
    try {
      await apiClient.updateCourse(course.id, { published: next });
      await onChanged();
      toast.success(next ? t('courseDetail.publishedToast') : t('courseDetail.unpublishedToast'));
    } catch (error) {
      toast.error(apiErrorMessage(error, t('courseDetail.publishFailed')));
    } finally {
      setSaving(false);
    }
  };

  if (!published) {
    if (course.course_type === 'LIVE') {
      return (
        <Button size="sm" variant="secondary" className={className} asChild>
          <a href={`/courses/${course.id}/live`}>
            <Globe className="me-1.5 h-3.5 w-3.5" />
            {t('courseDetail.publishLiveCourse')}
          </a>
        </Button>
      );
    }
    return (
      <Button size="sm" className={className} disabled={saving} onClick={() => setPublished(true)}>
        <Globe className="me-1.5 h-3.5 w-3.5" />
        {t('courseDetail.publish')}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="secondary" className={className} disabled={saving}>
          <EyeOff className="me-1.5 h-3.5 w-3.5" />
          {t('courseDetail.unpublish')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('courseDetail.unpublishConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('courseDetail.unpublishConfirmDesc')}</AlertDialogDescription>
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
