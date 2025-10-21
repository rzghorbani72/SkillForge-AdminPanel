'use client';

import { useSchool } from './useSchool';

/**
 * Hook to get the current selected school ID
 * Returns null if no school is selected or if there are no schools
 */
export function useCurrentSchoolId(): number | null {
  const { selectedSchool } = useSchool();
  return selectedSchool?.id || null;
}

/**
 * Hook to get the current selected school
 * Returns null if no school is selected
 */
export function useCurrentSchool() {
  const { selectedSchool } = useSchool();
  return selectedSchool;
}

/**
 * Hook to check if user has school access
 */
export function useHasSchoolAccess(): boolean {
  const { schools } = useSchool();
  return schools.length > 0;
}
