'use client';

import { useCallback } from 'react';
import { apiClient } from '@/lib/api';
import {
  EntitySearchCombobox,
  type EntitySearchComboboxProps
} from '@/components/entity-search/entity-search-combobox';
import { useTranslation } from '@/lib/i18n/hooks';
import type { EntitySearchOption } from '@/types/entity-search';
import type { TutoringSessionListItem } from '@/types/learning-operations';

interface TutoringSessionSearchComboboxProps
  extends Omit<EntitySearchComboboxProps, 'fetchOptions' | 'resolveOption'> {
  engagementId?: string;
}

function formatSessionLabel(
  session: TutoringSessionListItem,
  locale: string
): string {
  const course = session.Course?.title ?? session.engagement_id;
  const student = session.Student?.display_name ?? '—';
  const startsAt = new Date(session.starts_at).toLocaleString(locale);
  return `${course} · ${student} · ${startsAt}`;
}

function mapSessionToOption(
  session: TutoringSessionListItem,
  locale: string
): EntitySearchOption {
  return {
    value: session.id,
    label: formatSessionLabel(session, locale),
    description: session.status
  };
}

export function TutoringSessionSearchCombobox({
  engagementId,
  ...props
}: TutoringSessionSearchComboboxProps) {
  const { language } = useTranslation();
  const locale = language === 'fa' ? 'fa-IR' : 'en-US';

  const fetchOptions = useCallback(
    async (query: string): Promise<EntitySearchOption[]> => {
      const sessions = await apiClient.listTutoringSessions({
        search: query || undefined,
        engagement_id: engagementId,
        limit: 20
      });
      return sessions.map((session) => mapSessionToOption(session, locale));
    },
    [engagementId, locale]
  );

  const resolveOption = useCallback(
    async (id: string): Promise<EntitySearchOption | null> => {
      const sessions = await apiClient.listTutoringSessions({
        search: id,
        engagement_id: engagementId,
        limit: 20
      });
      const match = sessions.find((session) => session.id === id);
      return match ? mapSessionToOption(match, locale) : null;
    },
    [engagementId, locale]
  );

  return (
    <EntitySearchCombobox
      {...props}
      fetchOptions={fetchOptions}
      resolveOption={resolveOption}
    />
  );
}
