'use client';

import { useStore } from './useStore';

export function useCurrentAcademyId(): number | null {
  const { selectedAcademy } = useStore();
  return selectedAcademy?.id ?? null;
}

export function useCurrentAcademy() {
  const { selectedAcademy } = useStore();
  return selectedAcademy;
}

export function useHasAcademyAccess(): boolean {
  const { academies } = useStore();
  return academies.length > 0;
}
