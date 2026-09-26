import type { Academy } from '@/types/api';

export function getAcademyDomain(academy: Academy): string {
  return academy.domain?.private_address ?? academy.private_address ?? academy.slug ?? '';
}

export function filterAcademies(academies: Academy[], query: string): Academy[] {
  const q = query.toLowerCase();
  if (!q) return academies;
  return academies.filter(
    (a) => a.name.toLowerCase().includes(q) || getAcademyDomain(a).toLowerCase().includes(q),
  );
}

export function resolveAcademyRole(
  academy: { id: string; userRole?: string },
  currentAcademyId: string | null | undefined,
  currentRole: string,
): string {
  if (academy.userRole) return academy.userRole;
  if (academy.id === currentAcademyId) return currentRole;
  return '';
}
