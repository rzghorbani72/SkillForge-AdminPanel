'use client';

import {
  EntitySearchCombobox,
  type EntitySearchComboboxProps
} from '@/components/entity-search/entity-search-combobox';
import {
  fetchCourseOptions,
  resolveCourseOption
} from '@/components/entity-search/entity-search-utils';

type CourseSearchComboboxProps = Omit<
  EntitySearchComboboxProps,
  'fetchOptions' | 'resolveOption'
>;

export function CourseSearchCombobox(props: CourseSearchComboboxProps) {
  return (
    <EntitySearchCombobox
      {...props}
      fetchOptions={fetchCourseOptions}
      resolveOption={resolveCourseOption}
    />
  );
}
