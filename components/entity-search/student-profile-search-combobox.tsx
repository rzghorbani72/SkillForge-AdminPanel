'use client';

import { useCallback } from 'react';
import {
  EntitySearchCombobox,
  type EntitySearchComboboxProps
} from '@/components/entity-search/entity-search-combobox';
import {
  fetchStudentOptions,
  resolveUserOption
} from '@/components/entity-search/entity-search-utils';
import { useAuthUser } from '@/hooks/useAuthUser';

type StudentProfileSearchComboboxProps = Omit<
  EntitySearchComboboxProps,
  'fetchOptions' | 'resolveOption'
>;

export function StudentProfileSearchCombobox(
  props: StudentProfileSearchComboboxProps
) {
  const { user } = useAuthUser();
  const selfId = user?.id;

  const fetchOptions = useCallback(
    (query: string) => fetchStudentOptions(query, selfId),
    [selfId]
  );

  return (
    <EntitySearchCombobox
      {...props}
      fetchOptions={fetchOptions}
      resolveOption={(id) => resolveUserOption(id, 'student')}
    />
  );
}
