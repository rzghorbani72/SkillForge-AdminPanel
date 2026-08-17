import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { TutoringOffer } from '@/types/learning-operations';

/**
 * Private 1:1 tutoring for this course, read-only. It is priced from the
 * tutoring page because it needs a tutor and it is the only selling way that
 * consumes a plan seat — the pricing block shows it so the manager sees every
 * price for the course in one place.
 */
export function useCourseTutoringOffers(courseId: string | undefined) {
  const [offers, setOffers] = useState<TutoringOffer[]>([]);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    void apiClient
      .getTutoringOffers({ course_id: courseId })
      .then((list) => {
        if (!cancelled) setOffers(list);
      })
      .catch(() => {
        if (!cancelled) setOffers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return offers;
}
