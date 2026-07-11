'use client';

import {
  EntitySearchCombobox,
  type EntitySearchComboboxProps
} from '@/components/entity-search/entity-search-combobox';
import {
  fetchTeacherOptions,
  resolveUserOption
} from '@/components/entity-search/entity-search-utils';
import { useTranslation } from '@/lib/i18n/hooks';

type TeacherProfileSearchComboboxProps = Omit<
  EntitySearchComboboxProps,
  'fetchOptions' | 'resolveOption'
>;

export function TeacherProfileSearchCombobox(
  props: TeacherProfileSearchComboboxProps
) {
  const { t } = useTranslation();

  return (
    <EntitySearchCombobox
      {...props}
      placeholder={props.placeholder ?? t('entitySearch.searchTeacher')}
      fetchOptions={fetchTeacherOptions}
      resolveOption={(id) => resolveUserOption(id, 'teacher')}
    />
  );
}
