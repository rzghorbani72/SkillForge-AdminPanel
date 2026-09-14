import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useLearningNavCapabilities } from '@/hooks/useLearningNavCapabilities';
import type { TutoringOffer } from '@/types/learning-operations';

/**
 * Private 1:1 tutoring for this course, read-only. It is priced from the
 * tutoring page because it needs a tutor and it is the only selling way that
 * consumes a plan seat — the pricing block shows it so the manager sees every
 * price for the course in one place.
 */
export function useCourseTutoringOffers(courseId: string | undefined) {
  const [offers, setOffers] = useState<TutoringOffer[]>([]);
  const { academyFeatures } = useLearningNavCapabilities();

  // The endpoint 403s when the academy turned tutor-led learning off, so the
  // call is skipped instead of firing a request that can only fail.
  const tutorLedEnabled = academyFeatures === null || academyFeatures.tutor_led_learning_enabled;

  useEffect(() => {
    if (!courseId || !tutorLedEnabled) {
      setOffers([]);
      return;
    }
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
  }, [courseId, tutorLedEnabled]);

  return offers;
}
