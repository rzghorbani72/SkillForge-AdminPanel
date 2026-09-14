'use client';

import { useCallback, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { EntityMultiSelect, type SelectableEntity } from '@/components/shared/entity-multi-select';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';

const COURSE_PAGE_SIZE = 100;

type CourseTargetPickerProps = {
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  enabled?: boolean;
};

type CourseRecord = { id: string; title?: string | null };

/** Which courses the grant covers, for surfaces that don't already fix one. */
export function CourseTargetPicker({
  selected,
  onChange,
  disabled = false,
  enabled = true,
}: CourseTargetPickerProps) {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<SelectableEntity[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.getCourses({
        page: 1,
        limit: COURSE_PAGE_SIZE,
      });
      const records = (data?.courses ?? []) as CourseRecord[];
      setCourses(records.map((course) => ({ id: course.id, title: course.title || '—' })));
    } catch {
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  return (
    <div className="space-y-2">
      <Label>{t('accessGrants.courses')}</Label>
      <EntityMultiSelect
        items={courses}
        selected={selected}
        onChange={onChange}
        disabled={disabled}
        labels={{
          placeholder: t('accessGrants.selectCourses'),
          selected: t('accessGrants.courses'),
          search: t('common.search'),
          empty: t('accessGrants.noCourses'),
          remove: t('common.remove'),
        }}
      />
    </div>
  );
}
