'use client';

import type { Academy } from '@/types/api';

const ACADEMY_STORAGE_KEYS = {
  SELECTED_ACADEMY_ID: 'skillforge_selected_academy_id',
  ACADEMIES_CACHE: 'skillforge_academies_cache',
  LAST_FETCH: 'skillforge_academies_last_fetch'
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function getSelectedAcademyId(): number | null {
  if (typeof window === 'undefined') return null;

  const academyId = localStorage.getItem(
    ACADEMY_STORAGE_KEYS.SELECTED_ACADEMY_ID
  );
  return academyId ? parseInt(academyId, 10) : null;
}

export function setSelectedAcademyId(academyId: number): void {
  if (typeof window === 'undefined') return;
  const id = academyId.toString();
  localStorage.setItem(ACADEMY_STORAGE_KEYS.SELECTED_ACADEMY_ID, id);
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
        return JSON.parse(cached);
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
    localStorage.setItem(
      ACADEMY_STORAGE_KEYS.ACADEMIES_CACHE,
      JSON.stringify(academies)
    );
    localStorage.setItem(
      ACADEMY_STORAGE_KEYS.LAST_FETCH,
      Date.now().toString()
    );
  } catch (error) {
    console.error('Error caching academies:', error);
  }
}

export function getSelectedAcademy(academies: Academy[]): Academy | null {
  const selectedId = getSelectedAcademyId();
  if (!selectedId) return academies[0] || null;

  return academies.find((a) => a.id === selectedId) || academies[0] || null;
}

export function clearAcademyData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ACADEMY_STORAGE_KEYS.SELECTED_ACADEMY_ID);
    localStorage.removeItem(ACADEMY_STORAGE_KEYS.ACADEMIES_CACHE);
    localStorage.removeItem(ACADEMY_STORAGE_KEYS.LAST_FETCH);
  } catch (error) {
    console.error('Error clearing academy data:', error);
  }
}

export function validateAcademyCurrencyFields(academies: Academy[]): boolean {
  return academies.every((a) => a.currency || a.currency_symbol);
}

export function hasAcademyAccess(
  academyId: number,
  academies: Academy[]
): boolean {
  return academies.some((a) => a.id === academyId);
}

export function getAcademyById(
  academyId: number,
  academies: Academy[]
): Academy | null {
  return academies.find((a) => a.id === academyId) || null;
}

export function validateAcademySelection(academies: Academy[]): boolean {
  const selectedId = getSelectedAcademyId();
  if (!selectedId) return academies.length > 0;

  return academies.some((a) => a.id === selectedId);
}

export function autoSelectAcademy(
  academies: Academy[],
  preferredAcademyId?: number | null
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
