'use client';

import { useMemo } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';

/**
 * Whether the current user is scoped into a specific academy, used to drive the
 * sidebar's Platform vs Academy mode.
 * - Platform staff (ADMIN + SUPPORT): Platform mode until they select an academy
 *   from the switcher, at which point this flips to true (Academy mode).
 * - Other roles: undefined (mode separation does not apply).
 */
export function useHasStore(): boolean | undefined {
  const { user } = useAuthUser();
  const currentAcademy = useCurrentAcademy();

  return useMemo(() => {
    if (!user) return undefined;

    const isAdminProfile =
      user.isAdminProfile ?? user.profile?.isAdminProfile ?? false;
    const platformLevel =
      user.platformLevel ?? user.profile?.platformLevel ?? false;

    if (isAdminProfile || platformLevel) return !!currentAcademy;

    if (user.role !== 'ADMIN') return undefined;

    const profile = (user as any)?.profile;
    const academyId =
      profile?.academy_id ?? profile?.academyId ?? user.academyId ?? null;
    const currentAcademyData = profile?.academy ?? profile?.store ?? null;

    if (!academyId) {
      if (!currentAcademyData) return false;
    } else {
      return true;
    }
    if (currentAcademyData && currentAcademyData.id) return true;

    return false;
  }, [user, currentAcademy]);
}
