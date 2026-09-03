'use client';

import { useApiQuery } from '@/hooks/use-api-query';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { queryKeys } from '@/lib/query/keys';
import {
  getAcademyHealthSeries,
  getAcademyHealthSignals,
  type HealthRange,
  type HealthSeries,
  type HealthSignals
} from '@/lib/api-academy-health';

const SIGNALS_REFETCH_MS = 60_000;
const SERIES_STALE_MS = 5 * 60_000;

/** "Is it working right now" — cheap, so it refreshes on its own every minute. */
export function useHealthSignals() {
  const academyId = useCurrentAcademyId();

  return useApiQuery<HealthSignals>({
    queryKey: queryKeys.academyHealthSignals(academyId),
    queryFn: (signal) => getAcademyHealthSignals(signal),
    refetchInterval: SIGNALS_REFETCH_MS
  });
}

/** Daily trends. Heavier and slow-moving, so it is cached for a few minutes. */
export function useHealthSeries(days: HealthRange) {
  const academyId = useCurrentAcademyId();

  return useApiQuery<HealthSeries>({
    queryKey: queryKeys.academyHealthSeries(academyId, days),
    queryFn: (signal) => getAcademyHealthSeries(days, signal),
    staleTime: SERIES_STALE_MS,
    keepPrevious: true
  });
}
