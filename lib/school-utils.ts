'use client';

import { School } from '@/types/api';

// School management utilities
const SCHOOL_STORAGE_KEYS = {
  SELECTED_SCHOOL_ID: 'skillforge_selected_school_id',
  SCHOOLS_CACHE: 'skillforge_schools_cache',
  LAST_FETCH: 'skillforge_schools_last_fetch'
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get the currently selected school ID from localStorage
 */
export function getSelectedSchoolId(): number | null {
  if (typeof window === 'undefined') return null;

  const schoolId = localStorage.getItem(SCHOOL_STORAGE_KEYS.SELECTED_SCHOOL_ID);
  return schoolId ? parseInt(schoolId) : null;
}

/**
 * Set the selected school ID in localStorage
 */
export function setSelectedSchoolId(schoolId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    SCHOOL_STORAGE_KEYS.SELECTED_SCHOOL_ID,
    schoolId.toString()
  );
}

/**
 * Get cached schools from localStorage
 */
export function getCachedSchools(): School[] {
  if (typeof window === 'undefined') return [];

  try {
    const cached = localStorage.getItem(SCHOOL_STORAGE_KEYS.SCHOOLS_CACHE);
    const lastFetch = localStorage.getItem(SCHOOL_STORAGE_KEYS.LAST_FETCH);

    if (cached && lastFetch) {
      const lastFetchTime = parseInt(lastFetch);
      const now = Date.now();

      if (now - lastFetchTime < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    console.error('Error reading cached schools:', error);
  }

  return [];
}

/**
 * Cache schools in localStorage
 */
export function setCachedSchools(schools: School[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      SCHOOL_STORAGE_KEYS.SCHOOLS_CACHE,
      JSON.stringify(schools)
    );
    localStorage.setItem(SCHOOL_STORAGE_KEYS.LAST_FETCH, Date.now().toString());
  } catch (error) {
    console.error('Error caching schools:', error);
  }
}

/**
 * Get the selected school from a list of schools
 */
export function getSelectedSchool(schools: School[]): School | null {
  const selectedId = getSelectedSchoolId();
  if (!selectedId) return schools[0] || null;

  return (
    schools.find((school) => school.id === selectedId) || schools[0] || null
  );
}

/**
 * Clear all school-related data from localStorage
 */
export function clearSchoolData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SCHOOL_STORAGE_KEYS.SELECTED_SCHOOL_ID);
    localStorage.removeItem(SCHOOL_STORAGE_KEYS.SCHOOLS_CACHE);
    localStorage.removeItem(SCHOOL_STORAGE_KEYS.LAST_FETCH);
  } catch (error) {
    console.error('Error clearing school data:', error);
  }
}

/**
 * Check if cached schools have currency fields
 * Returns true if all schools have currency config, false otherwise
 */
export function validateSchoolCurrencyFields(schools: School[]): boolean {
  return schools.every((school) => school.currency || school.currency_symbol);
}

/**
 * Check if user has access to a specific school
 */
export function hasSchoolAccess(schoolId: number, schools: School[]): boolean {
  return schools.some((school) => school.id === schoolId);
}

/**
 * Get school by ID from a list of schools
 */
export function getSchoolById(
  schoolId: number,
  schools: School[]
): School | null {
  return schools.find((school) => school.id === schoolId) || null;
}

/**
 * Validate if the current school selection is still valid
 */
export function validateSchoolSelection(schools: School[]): boolean {
  const selectedId = getSelectedSchoolId();
  if (!selectedId) return schools.length > 0;

  return schools.some((school) => school.id === selectedId);
}

/**
 * Auto-select a school if none is selected or current selection is invalid
 */
export function autoSelectSchool(schools: School[]): School | null {
  if (schools.length === 0) return null;

  const selectedId = getSelectedSchoolId();
  const selectedSchool = schools.find((school) => school.id === selectedId);

  if (selectedSchool) {
    return selectedSchool;
  }

  // If no valid selection, select the first school
  const firstSchool = schools[0];
  setSelectedSchoolId(firstSchool.id);
  return firstSchool;
}

/**
 * Extract and format the first part of domain (before the dot)
 */
export function extractDomainPart(domain: string): string {
  if (!domain) return '';
  const cleanDomain = domain
    .replace(/\.skillforge\.com$/i, '')
    .replace(/\./g, '');

  if (!cleanDomain) return '';
  return cleanDomain
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert domain to standard format (lowercase, kebab-case)
 */
export function formatDomain(domain: string): string {
  if (!domain) return '';
  return domain
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
