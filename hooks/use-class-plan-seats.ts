'use client';

import { apiClient } from '@/lib/api';
import { useApiQuery } from '@/hooks/use-api-query';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { queryKeys } from '@/lib/query/keys';
import type { ClassPlanSeats } from '@/types/learning-operations';

export function useClassPlanSeats() {
  const academyId = useCurrentAcademyId();
  const { data } = useApiQuery<ClassPlanSeats>({
    queryKey: queryKeys.classPlanSeats(academyId),
    queryFn: () => apiClient.getClassPlanSeats(),
  });
  return data ?? null;
}
