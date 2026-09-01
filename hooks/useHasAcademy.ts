'use client';

import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformStaff } from '@/lib/roles';

/**
 * Whether the user belongs to at least one academy.
 *
 * Undefined means "do not gate on this": either the list is still loading, or
 * the user is platform staff, who are meant to work without an academy.
 */
export function useHasAcademy(): boolean | undefined {
  const { academies, isLoading } = useStore();
  const { user } = useAuthUser();

  if (isLoading || !user || isPlatformStaff(user)) return undefined;
  return academies.length > 0;
}
