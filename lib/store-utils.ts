'use client';

import type { Academy } from '@/types/api';
import { ACADEMY_DOMAIN } from '@/lib/slug';

const ACADEMY_STORAGE_KEYS = {
  SELECTED_ACADEMY_ID: 'selected_academy_id',
  ACADEMIES_CACHE: 'academies_cache',
  LAST_FETCH: 'academies_last_fetch',
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Academy ids are cuid strings. Parsing them as integers turned every stored
// selection into NaN, so "remember my academy" silently fell back to the first
// academy in the list.
export function getSelectedAcademyId(): string | null {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem(ACADEMY_STORAGE_KEYS.SELECTED_ACADEMY_ID);
}

export function setSelectedAcademyId(academyId: string): void {
  if (typeof window === 'undefined') return;
  if (!academyId) return;
  localStorage.setItem(ACADEMY_STORAGE_KEYS.SELECTED_ACADEMY_ID, academyId);
}

export function getCachedAcademies(): Academy[] {
  if (typeof window === 'undefined') return [];

  try {
    const cached = localStorage.getItem(ACADEMY_STORAGE_KEYS.ACADEMIES_CACHE);
    const lastFetch = localStorage.getItem(ACADEMY_STORAGE_KEYS.LAST_FETCH);

    if (cached && lastFetch) {
      const lastFetchTime = parseInt(lastFetch);
      const now = Date.now();

      if (now - lastFetchTime < CACHE_DURATION) {
        const parsed: Academy[] = JSON.parse(cached);
        // Discard cache entries that are missing id (stale data from old stripIds interceptor)
        if (parsed.some((a) => a.id == null)) {
          localStorage.removeItem(ACADEMY_STORAGE_KEYS.ACADEMIES_CACHE);
          localStorage.removeItem(ACADEMY_STORAGE_KEYS.LAST_FETCH);
          return [];
        }
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading cached academies:', error);
  }

  return [];
}

export function setCachedAcademies(academies: Academy[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ACADEMY_STORAGE_KEYS.ACADEMIES_CACHE, JSON.stringify(academies));
    localStorage.setItem(ACADEMY_STORAGE_KEYS.LAST_FETCH, Date.now().toString());
  } catch (error) {
    console.error('Error caching academies:', error);
  }
}

export function getSelectedAcademy(academies: Academy[]): Academy | null {
  const selectedId = getSelectedAcademyId();
  if (!selectedId) return academies[0] || null;

  return academies.find((a) => a.id === selectedId) || academies[0] || null;
}

/** One re-scope attempt per session, cleared whenever the academy data is. */
export const ACADEMY_RESCOPE_FLAG = 'academy_rescoped';

export function clearAcademyData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ACADEMY_STORAGE_KEYS.SELECTED_ACADEMY_ID);
    localStorage.removeItem(ACADEMY_STORAGE_KEYS.ACADEMIES_CACHE);
    localStorage.removeItem(ACADEMY_STORAGE_KEYS.LAST_FETCH);
    // Kept per tab, so a second login in the same tab would otherwise never
    // re-scope an academy-less session and every scoped request would fail.
    sessionStorage.removeItem(ACADEMY_RESCOPE_FLAG);
  } catch (error) {
    console.error('Error clearing academy data:', error);
  }
}

export function validateAcademyCurrencyFields(academies: Academy[]): boolean {
  return academies.every((a) => a.currency || a.currency_symbol);
}

export function hasAcademyAccess(academyId: string, academies: Academy[]): boolean {
  return academies.some((a) => a.id === academyId);
}

export function getAcademyById(academyId: string, academies: Academy[]): Academy | null {
  return academies.find((a) => a.id === academyId) || null;
}

export function validateAcademySelection(academies: Academy[]): boolean {
  const selectedId = getSelectedAcademyId();
  if (!selectedId) return academies.length > 0;

  return academies.some((a) => a.id === selectedId);
}

export function autoSelectAcademy(
  academies: Academy[],
  preferredAcademyId?: string | null,
): Academy | null {
  if (academies.length === 0) return null;

  if (preferredAcademyId) {
    const preferred = academies.find((a) => a.id === preferredAcademyId);
    if (preferred) {
      const currentSelectedId = getSelectedAcademyId();
      if (currentSelectedId !== preferredAcademyId) {
        setSelectedAcademyId(preferredAcademyId);
      }
      return preferred;
    }
    const currentSelectedId = getSelectedAcademyId();
    if (currentSelectedId === preferredAcademyId) {
      localStorage.removeItem(ACADEMY_STORAGE_KEYS.SELECTED_ACADEMY_ID);
    }
  }

  const selectedId = getSelectedAcademyId();
  const selected = academies.find((a) => a.id === selectedId);

  if (selected) {
    return selected;
  }

  const first = academies[0];
  setSelectedAcademyId(first.id);
  return first;
}

export function extractDomainPart(domain: string): string {
  if (!domain) return '';
  const domainSuffix = new RegExp(`\\.${ACADEMY_DOMAIN.replace(/\./g, '\\.')}$`, 'i');
  const cleanDomain = domain.replace(domainSuffix, '').replace(/\./g, '');

  if (!cleanDomain) return '';
  return cleanDomain
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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
