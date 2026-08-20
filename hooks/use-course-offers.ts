'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Offer, OfferInput } from '@/types/api';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useApiQuery } from '@/hooks/use-api-query';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { queryKeys } from '@/lib/query/keys';

const EMPTY_OFFERS: Offer[] = [];

// Manages the offers that unlock ONE course. A course can be sold several ways
// at once (one-time / subscription / installments), plus the read-only default
// offer that carries the course's own price.
export function useCourseOffers(courseId: string | undefined) {
  const academyId = useCurrentAcademyId();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const queryKey = queryKeys.courseOffers(academyId, courseId);

  const { data, isLoading } = useApiQuery<Offer[]>({
    queryKey,
    queryFn: (signal) => apiClient.getCourseOffers(courseId ?? '', { signal }),
    enabled: Boolean(courseId)
  });

  const refresh = useCallback(
    async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, academyId, courseId]
  );

  const runMutation = useCallback(
    async (action: () => Promise<unknown>, failureKey: string) => {
      setIsSaving(true);
      try {
        await action();
        await refresh();
      } catch (e) {
        toast.error(apiErrorMessage(e, tNow(failureKey)));
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  const create = useCallback(
    async (input: Omit<OfferInput, 'course_ids'>) => {
      if (!courseId) return;
      await runMutation(
        () => apiClient.createOffer({ ...input, course_ids: [courseId] }),
        'toasts.offerAddFailed'
      );
    },
    [courseId, runMutation]
  );

  const update = useCallback(
    async (id: string, patch: Partial<OfferInput>) => {
      await runMutation(
        () => apiClient.updateOffer(id, patch),
        'toasts.offerUpdateFailed'
      );
    },
    [runMutation]
  );

  const toggleActive = useCallback(
    async (offer: Offer) => update(offer.id, { is_active: !offer.is_active }),
    [update]
  );

  const remove = useCallback(
    async (id: string) => {
      await runMutation(
        () => apiClient.deleteOffer(id),
        'toasts.offerDeleteFailed'
      );
    },
    [runMutation]
  );

  return {
    offers: data ?? EMPTY_OFFERS,
    isLoading,
    isSaving,
    refresh,
    create,
    update,
    toggleActive,
    remove
  };
}
