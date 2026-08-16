'use client';

import { KeyRound } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { toast } from 'react-toastify';
import { accessGrantsApi } from '@/lib/api-extra';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useTranslation } from '@/lib/i18n/hooks';
import { tNow } from '@/lib/i18n/t-now';
import {
  AssignAccessForm,
  type AssignAccessSelection
} from './assign-access-form';

type StagedAccessSectionProps = {
  onChange: (selection: AssignAccessSelection | null) => void;
};

/**
 * The same box on the create page, where there is no course to grant against
 * yet. The selection is reported upward and written by `applyAccessSelection`
 * once the course exists.
 */
export function StagedAccessSection({ onChange }: StagedAccessSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          {t('accessGrants.title')}
        </CardTitle>
        <CardDescription>{t('accessGrants.stagedDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <AssignAccessForm onSelectionChange={onChange} />
      </CardContent>
    </Card>
  );
}

/**
 * Writes the chosen access now that the course is saved. The course itself is
 * already stored at this point, so a failure here is reported without losing it.
 */
export async function applyAccessSelection(
  courseId: string,
  selection: AssignAccessSelection | null
): Promise<void> {
  if (!selection) return;
  try {
    await accessGrantsApi.create({ course_ids: [courseId], ...selection });
  } catch (error) {
    toast.error(apiErrorMessage(error, tNow('accessGrants.stagedFailed')));
  }
}
