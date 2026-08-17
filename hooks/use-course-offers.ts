import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Offer, OfferInput } from '@/types/api';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { apiErrorMessage } from '@/lib/api-error-message';

// Manages the offers that unlock ONE course. A course can be sold several ways
// at once (one-time / subscription / installments), plus the read-only default
// offer that carries the course's own price.
export function useCourseOffers(courseId: string | undefined) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      setOffers(await apiClient.getCourseOffers(courseId));
    } catch {
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: Omit<OfferInput, 'course_ids'>) => {
      if (!courseId) return;
      setIsSaving(true);
      try {
        await apiClient.createOffer({ ...input, course_ids: [courseId] });
        await refresh();
      } catch (e) {
        toast.error(apiErrorMessage(e, tNow('toasts.offerAddFailed')));
      } finally {
        setIsSaving(false);
      }
    },
    [courseId, refresh]
  );

  const update = useCallback(
    async (id: string, patch: Partial<OfferInput>) => {
      setIsSaving(true);
      try {
        await apiClient.updateOffer(id, patch);
        await refresh();
      } catch (e) {
        toast.error(apiErrorMessage(e, tNow('toasts.offerUpdateFailed')));
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  const toggleActive = useCallback(
    async (offer: Offer) => update(offer.id, { is_active: !offer.is_active }),
    [update]
  );

  const remove = useCallback(
    async (id: string) => {
      setIsSaving(true);
      try {
        await apiClient.deleteOffer(id);
        await refresh();
      } catch (e) {
        toast.error(apiErrorMessage(e, tNow('toasts.offerDeleteFailed')));
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  return {
    offers,
    isLoading,
    isSaving,
    refresh,
    create,
    update,
    toggleActive,
    remove
  };
}
