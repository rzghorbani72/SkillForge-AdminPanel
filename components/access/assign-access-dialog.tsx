'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { accessGrantsApi, type CreateAccessGrantBody } from '@/lib/api-extra';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  AssignAccessForm,
  type AssignAccessSelection
} from './assign-access-form';
import { CourseTargetPicker } from './course-target-picker';

type AssignAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fixed scope when opened from a bundle or a course. */
  scope?: { offer_id: string } | { course_ids: string[] };
  /** Pre-selected students, e.g. the row the manager clicked on /users. */
  initialProfileIds?: string[];
  onGranted?: () => void;
};

/**
 * "Give access" as a dialog. Opened from the users page (pick the courses) or
 * from a bundle/course (courses already fixed).
 */
export function AssignAccessDialog({
  open,
  onOpenChange,
  scope,
  initialProfileIds,
  onGranted
}: AssignAccessDialogProps) {
  const { t } = useTranslation();
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const needsCoursePicker = !scope;
  const canSubmit = !needsCoursePicker || courseIds.length > 0;

  async function handleSubmit(selection: AssignAccessSelection) {
    setIsSaving(true);
    try {
      const body: CreateAccessGrantBody = {
        ...selection,
        profile_ids: Array.from(
          new Set([...(initialProfileIds ?? []), ...selection.profile_ids])
        ),
        ...(scope ?? { course_ids: courseIds })
      };
      const summary = await accessGrantsApi.create(body);
      toast.success(
        t('accessGrants.granted', {
          count: String(summary.student_grants + summary.group_grants)
        })
      );
      setCourseIds([]);
      onGranted?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, t('accessGrants.grantFailed')));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('accessGrants.title')}</DialogTitle>
          <DialogDescription>{t('accessGrants.description')}</DialogDescription>
        </DialogHeader>

        {needsCoursePicker && (
          <CourseTargetPicker
            selected={courseIds}
            onChange={setCourseIds}
            disabled={isSaving}
            enabled={open}
          />
        )}

        <AssignAccessForm
          onSubmit={handleSubmit}
          isSaving={isSaving}
          disabled={!canSubmit}
          enabled={open}
          hasExternalTarget={(initialProfileIds?.length ?? 0) > 0}
        />
      </DialogContent>
    </Dialog>
  );
}
