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
      {/* Header pinned, only the body scrolls — overflow-y-auto on
          DialogContent itself would scroll the header too, so the native
          scrollbar runs the dialog's full height and reads as a stray bar
          instead of marking where the actual overflow is. */}
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-6 pb-4 pt-6">
          <DialogTitle>{t('accessGrants.title')}</DialogTitle>
          <DialogDescription>{t('accessGrants.description')}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
