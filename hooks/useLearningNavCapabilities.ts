'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import {
  shouldApplyLearningNavGating,
  type LearningNavVisibility
} from '@/lib/nav-filter';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useHasStore } from '@/hooks/useHasStore';

const DEFAULT_VISIBILITY: LearningNavVisibility = {
  students: false,
  assignments: false,
  ops_queue: false,
  tutoring: false
};

export function useLearningNavCapabilities() {
  const { user } = useAuthUser();
  const hasStore = useHasStore();
  const [visibility, setVisibility] =
    useState<LearningNavVisibility>(DEFAULT_VISIBILITY);
  const [isLoading, setIsLoading] = useState(true);

  const shouldResolve = useMemo(() => {
    if (!user?.role) return false;
    return shouldApplyLearningNavGating(user.role, hasStore);
  }, [user?.role, hasStore]);

  useEffect(() => {
    if (!shouldResolve) {
      setVisibility(DEFAULT_VISIBILITY);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getLearningNavCapabilities();
        if (!cancelled) {
          setVisibility(data.visibility);
        }
      } catch {
        if (!cancelled) {
          setVisibility(DEFAULT_VISIBILITY);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [shouldResolve, user?.role]);

  return {
    visibility: shouldResolve ? visibility : null,
    isLoading: shouldResolve ? isLoading : false,
    shouldResolve
  };
}
