'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [visibility, setVisibility] =
    useState<LearningNavVisibility>(DEFAULT_VISIBILITY);
  const [sellingTypes, setSellingTypes] = useState<SellingTypes>(
    DEFAULT_SELLING_TYPES
  );
  const [academyFeatures, setAcademyFeatures] = useState<AcademyFeatures>(
    DEFAULT_ACADEMY_FEATURES
  );
  const [isLoading, setIsLoading] = useState(true);

  const shouldResolve = useMemo(() => {
    if (!user?.role) return false;
    return shouldApplyLearningNavGating(user.role, hasStore);
  }, [user?.role, hasStore]);

  useEffect(() => {
    if (!shouldResolve) {
      setVisibility(DEFAULT_VISIBILITY);
      setSellingTypes(DEFAULT_SELLING_TYPES);
      setAcademyFeatures(DEFAULT_ACADEMY_FEATURES);
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
          setSellingTypes(data.selling_types);
          setAcademyFeatures(data.academy_features);
        }
      } catch {
        if (!cancelled) {
          setVisibility(DEFAULT_VISIBILITY);
          setSellingTypes(DEFAULT_SELLING_TYPES);
          setAcademyFeatures(DEFAULT_ACADEMY_FEATURES);
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
    sellingTypes: shouldResolve ? sellingTypes : null,
    academyFeatures: shouldResolve ? academyFeatures : null,
    isLoading: shouldResolve ? isLoading : false,
    shouldResolve
  };
}
