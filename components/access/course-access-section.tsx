'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-toastify';
import {
  accessGrantsApi,
  type GroupAccessGrant,
  type StudentAccessGrant
} from '@/lib/api-extra';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useTranslation } from '@/lib/i18n/hooks';
import { AccessGrantList } from './access-grant-list';
import {
  AssignAccessForm,
  type AssignAccessSelection
} from './assign-access-form';

type CourseAccessSectionProps = {
  courseId: string;
  /**
   * Given this, the box stops granting on its own: the selection is reported
   * upward and written when the page's own save runs.
   */
  onPendingChange?: (selection: AssignAccessSelection | null) => void;
};

/**
 * The "give access to students" box on a saved course: hand the course to
 * students or groups for a chosen term, and see/undo who already holds it.
 */
export function CourseAccessSection({
  courseId,
  onPendingChange
}: CourseAccessSectionProps) {
  const { t } = useTranslation();
  const [students, setStudents] = useState<StudentAccessGrant[]>([]);
  const [groups, setGroups] = useState<GroupAccessGrant[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await accessGrantsApi.list(courseId);
      setStudents(response.data.students);
      setGroups(response.data.groups);
    } catch {
      setStudents([]);
      setGroups([]);
    }
  }, [courseId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleGrant(selection: AssignAccessSelection) {
    setIsSaving(true);
    try {
      const summary = await accessGrantsApi.create({
        course_ids: [courseId],
        ...selection
      });
      toast.success(
        t('accessGrants.granted', {
          count: summary.student_grants + summary.group_grants
        })
      );
      await refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, t('accessGrants.grantFailed')));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRevoke(target: {
    profile_id?: string;
    group_id?: string;
  }) {
    setIsSaving(true);
    try {
      await accessGrantsApi.revoke({ course_id: courseId, ...target });
      toast.success(t('accessGrants.revoked'));
      await refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, t('accessGrants.revokeFailed')));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          {t('accessGrants.title')}
        </CardTitle>
        <CardDescription>
          {onPendingChange
            ? t('accessGrants.stagedDescription')
            : t('accessGrants.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {onPendingChange ? (
          <AssignAccessForm onSelectionChange={onPendingChange} />
        ) : (
          <AssignAccessForm onSubmit={handleGrant} isSaving={isSaving} />
        )}
        <Separator />
        <AccessGrantList
          students={students}
          groups={groups}
          onRevoke={handleRevoke}
          isBusy={isSaving}
        />
      </CardContent>
    </Card>
  );
}
