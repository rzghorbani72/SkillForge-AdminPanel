import { authService } from './auth';
import { PanelRole } from '@/lib/roles';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

const PANEL_ROLES: PanelRole[] = [
  'PLATFORM_OWNER',
  'ADMIN',
  'FINANCE',
  'SUPPORT',
  'MANAGER',
  'TEACHER',
  'STUDENT',
];

function isPanelRole(role: string): role is PanelRole {
  return (PANEL_ROLES as string[]).includes(role);
}

/** Role from in-memory session only — never from localStorage (console spoofing). */
export function getUserRole(): PanelRole | null {
  if (typeof window === 'undefined') return null;

  try {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.currentProfile) {
      const role =
        (currentUser.currentProfile as { role?: { name?: string } }).role?.name ||
        (currentUser.currentProfile as { role_name?: string }).role_name ||
        (currentUser.currentProfile as { role?: string }).role;

      if (typeof role === 'string' && isPanelRole(role)) {
        return role;
      }
    }
  } catch (error) {
    logger.error('Session', 'ExtractingUserRoleFailed', errorFields(error));
  }

  return null;
}
