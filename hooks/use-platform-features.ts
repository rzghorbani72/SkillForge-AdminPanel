'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { PlatformFeatures } from '@/lib/api-client/types-1';

const ALL_OFF: PlatformFeatures = { quizzes_enabled: false, certificates_enabled: false };

/** Platform-wide switches set by the owner; off until loaded so hidden features never flash. */
export function usePlatformFeatures(): PlatformFeatures {
  const { data } = useQuery({
    queryKey: ['platform-features'],
    queryFn: () => apiClient.getPlatformFeatures(),
    staleTime: 5 * 60_000,
  });
  return data ?? ALL_OFF;
}
