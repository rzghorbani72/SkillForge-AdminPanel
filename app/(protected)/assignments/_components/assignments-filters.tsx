'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CourseSearchCombobox } from '@/components/entity-search';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SubmissionStatus } from '@/types/learning-operations';

const STATUS_OPTIONS: Array<SubmissionStatus | 'ALL'> = [
  'ALL',
  'SUBMITTED',
  'GRADED',
  'REJECTED',
  'DRAFT'
];

interface AssignmentsFiltersProps {
  courseId: string;
  onCourseIdChange: (value: string) => void;
  status: SubmissionStatus | 'ALL';
  onStatusChange: (value: SubmissionStatus | 'ALL') => void;
  showStatusFilter: boolean;
  onClear: () => void;
}

export function AssignmentsFilters({
  courseId,
  onCourseIdChange,
  status,
  onStatusChange,
  showStatusFilter,
  onClear
}: AssignmentsFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-[220px] flex-1 space-y-2">
        <Label htmlFor="assignments-course-filter">
          {t('assignmentsPage.filterByCourse')}
        </Label>
        <CourseSearchCombobox
          id="assignments-course-filter"
          value={courseId}
          onValueChange={onCourseIdChange}
          placeholder={t('assignmentsPage.filterByCourse')}
        />
      </div>
      {showStatusFilter ? (
        <div className="w-full space-y-2 sm:w-48">
          <Label htmlFor="assignments-status-filter">
            {t('assignmentsPage.filterByStatus')}
          </Label>
          <Select
            value={status}
            onValueChange={(value) =>
              onStatusChange(value as SubmissionStatus | 'ALL')
            }
          >
            <SelectTrigger
              id="assignments-status-filter"
              aria-label={t('assignmentsPage.filterByStatus')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === 'ALL'
                    ? t('assignmentsPage.allStatuses')
                    : t(`learningOperations.status.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <Button type="button" variant="outline" onClick={onClear}>
        {t('assignmentsPage.clearFilters')}
      </Button>
    </div>
  );
}
