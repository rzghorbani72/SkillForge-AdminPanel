'use client';

import {
  EntitySearchCombobox,
  type EntitySearchComboboxProps
} from '@/components/entity-search/entity-search-combobox';
import {
  fetchStudentOptions,
  resolveUserOption
} from '@/components/entity-search/entity-search-utils';

type StudentProfileSearchComboboxProps = Omit<
  EntitySearchComboboxProps,
  'fetchOptions' | 'resolveOption'
>;

export function StudentProfileSearchCombobox(
  props: StudentProfileSearchComboboxProps
) {
  return (
    <EntitySearchCombobox
      {...props}
      fetchOptions={fetchStudentOptions}
      resolveOption={(id) => resolveUserOption(id, 'student')}
    />
  );
}
