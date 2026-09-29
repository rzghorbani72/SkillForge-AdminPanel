'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { queryKeys } from '@/lib/query/keys';
import type { TutoringOfferKind } from '@/types/learning-operations';

export interface NewOfferTarget {
  courseId: string;
  courseTitle: string;
  tutorProfileId: string;
}

/**
 * Creates a course's GROUP or SOLO price. The first one can switch class
 * selling on for the academy, which adds class pages to the sidebar.
 */
export function useCreateTutoringOffer() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const academyId = useCurrentAcademyId();

  return useCallback(
    async (target: NewOfferTarget, kind: TutoringOfferKind, price: number) => {
      const offer = await apiClient.createTutoringOffer({
        course_id: target.courseId,
        tutor_profile_id: target.tutorProfileId,
        kind,
        title: `${target.courseTitle} — ${t(`courses.live.${kind === 'SOLO' ? 'solo' : 'group'}`)}`,
        price,
      });
      if (offer.feature_enabled_now) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.learningNavCapabilities(academyId),
        });
      }
      return offer;
    },
    [academyId, queryClient, t],
  );
}
