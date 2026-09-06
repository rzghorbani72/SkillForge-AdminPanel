'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { TutoringOffer } from '@/types/learning-operations';

/**
 * A live course is priced through its tutoring offers, not `course.price`.
 * A recorded course never pays for the request.
 */
export function useTutoringOffers(courseId: string, enabled: boolean) {
  const [offers, setOffers] = useState<TutoringOffer[]>([]);

  useEffect(() => {
    if (!courseId || !enabled) {
      setOffers([]);
      return;
    }
    const load = async () => {
      const data = await apiClient
        .getTutoringOffers({ course_id: courseId })
        .catch(() => []);
      setOffers(data);
    };
    void load();
  }, [courseId, enabled]);

  return offers;
}
