'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { apiClient, type LearningNavCapabilities } from '@/lib/api';
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

type SellingTypes = LearningNavCapabilities['selling_types'];
type AcademyFeatures = LearningNavCapabilities['academy_features'];

const DEFAULT_SELLING_TYPES: SellingTypes = {
  one_time: false,
  public_sub: false,
  private_sub: false
};

const DEFAULT_ACADEMY_FEATURES: AcademyFeatures = {
  tutor_led_learning_enabled: false
};

export function useLearningNavCapabilities() {
  const { user } = useAuthUser();
  const hasStore = useHasStore();

  const shouldResolve = useMemo(() => {
    if (!user?.role) return false;
    return shouldApplyLearningNavGating(user.role, hasStore);
  }, [user?.role, hasStore]);

  // Sidebar, mobile sidebar and the nav gate all mount together; a shared SWR
  // key makes them read one request instead of firing one each.
  const { data, isLoading } = useSWR<LearningNavCapabilities>(
    shouldResolve ? 'learning-nav-capabilities' : null,
    () => apiClient.getLearningNavCapabilities(),
    { revalidateOnFocus: false, dedupingInterval: 2000 }
  );

  return {
    visibility: shouldResolve ? (data?.visibility ?? DEFAULT_VISIBILITY) : null,
    sellingTypes: shouldResolve
      ? (data?.selling_types ?? DEFAULT_SELLING_TYPES)
      : null,
    academyFeatures: shouldResolve
      ? (data?.academy_features ?? DEFAULT_ACADEMY_FEATURES)
      : null,
    isLoading: shouldResolve ? isLoading : false,
    shouldResolve
  };
}
