'use client';

import { useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import {
  EntitySearchCombobox,
  type EntitySearchComboboxProps,
} from '@/components/entity-search/entity-search-combobox';
import { useTranslation } from '@/lib/i18n/hooks';
import type { EntitySearchOption } from '@/types/entity-search';

interface LessonSearchComboboxProps
  extends Omit<EntitySearchComboboxProps, 'fetchOptions' | 'resolveOption'> {
  courseId: string;
}

interface LessonRecord {
  id: number | string;
  title: string;
}

export function LessonSearchCombobox({ courseId, disabled, ...props }: LessonSearchComboboxProps) {
  const { t } = useTranslation();

  const fetchOptions = useCallback(
    async (query: string): Promise<EntitySearchOption[]> => {
      if (!courseId) {
        return [];
      }

      const lessons = (await apiClient.getLessons({
        course_id: courseId,
        limit: 200,
      })) as LessonRecord[];

      const normalizedQuery = query.trim().toLowerCase();

      return lessons
        .filter((lesson) => {
          if (!normalizedQuery) {
            return true;
          }
          const title = lesson.title.toLowerCase();
          const id = String(lesson.id);
          return title.includes(normalizedQuery) || id.includes(normalizedQuery);
        })
        .slice(0, 20)
        .map((lesson) => ({
          value: String(lesson.id),
          label: lesson.title,
        }));
    },
    [courseId],
  );

  const resolveOption = useCallback(
    async (id: string): Promise<EntitySearchOption | null> => {
      if (!courseId) {
        return null;
      }
      const options = await fetchOptions(id);
      return options.find((option) => option.value === id) ?? null;
    },
    [courseId, fetchOptions],
  );

  const isDisabled = useMemo(() => disabled || !courseId, [courseId, disabled]);

  return (
    <EntitySearchCombobox
      {...props}
      disabled={isDisabled}
      placeholder={
        props.placeholder ??
        (courseId ? t('entitySearch.searchPlaceholder') : t('entitySearch.selectCourseFirst'))
      }
      fetchOptions={fetchOptions}
      resolveOption={resolveOption}
    />
  );
}
