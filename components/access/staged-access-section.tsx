'use client';

import { KeyRound, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  staged: AssignAccessSelection[];
  onChange: (staged: AssignAccessSelection[]) => void;
};

/**
 * The same box on the create page, where there is no course to grant against
 * yet. Selections are held here and written by `applyStagedGrants` once the
 * course exists.
 */
export function StagedAccessSection({
  staged,
  onChange
}: StagedAccessSectionProps) {
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
      <CardContent className="space-y-4">
        <AssignAccessForm
          onSubmit={(selection) => onChange([...staged, selection])}
          submitLabel={t('accessGrants.addToList')}
        />

        {staged.length > 0 && (
          <ul className="divide-y rounded-md border">
            {staged.map((entry, index) => (
              <li
                key={`${index}-${entry.profile_ids.length}-${entry.group_ids.length}`}
                className="flex items-center gap-3 p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  {t('accessGrants.stagedRow', {
                    students: String(entry.profile_ids.length),
                    groups: String(entry.group_ids.length)
                  })}
                </div>
                <Badge variant="outline">
                  {entry.duration.mode === 'forever'
                    ? t('accessGrants.durationForever')
                    : entry.duration.mode === 'days'
                      ? t('accessGrants.dayCount', {
                          count: String(entry.duration.days)
                        })
                      : t('accessGrants.durationUntil')}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t('common.remove')}
                  onClick={() =>
                    onChange(staged.filter((_, position) => position !== index))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Writes the staged grants now that the course has an id. The course is already
 * saved at this point, so a failure here is reported without losing the course.
 */
export async function applyStagedGrants(
  courseId: string,
  staged: AssignAccessSelection[]
): Promise<void> {
  if (staged.length === 0) return;
  try {
    for (const selection of staged) {
      await accessGrantsApi.create({ course_ids: [courseId], ...selection });
    }
  } catch (error) {
    toast.error(apiErrorMessage(error, tNow('accessGrants.stagedFailed')));
  }
}
