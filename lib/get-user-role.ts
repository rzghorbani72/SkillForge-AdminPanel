import { jwtDecode } from 'jwt-decode';
import { authService } from './auth';
import { PanelRole } from '@/lib/roles';

const PANEL_ROLES: PanelRole[] = [
  'PLATFORM_OWNER',
  'ADMIN',
  'FINANCE',
  'SUPPORT',
  'MANAGER',
  'TEACHER',
  'STUDENT'
];

function isPanelRole(role: string): role is PanelRole {
  return (PANEL_ROLES as string[]).includes(role);
}

export function getUserRole(): PanelRole | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try to get role from auth service
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const role =
        (currentUser.currentProfile as any)?.role?.name ||
        (currentUser.currentProfile as any)?.role_name ||
        (currentUser.currentProfile as any)?.role ||
        (currentUser as any)?.role;

      if (role && isPanelRole(role)) {
        return role;
      }
    }

    // Try to get role from localStorage user_state
    const userStateStr = window.localStorage.getItem('user_state');
    if (userStateStr) {
      try {
        const userState = JSON.parse(userStateStr);
        if (userState?.role && isPanelRole(userState.role)) {
          return userState.role;
        }
      } catch (e) {
        // Invalid JSON, continue
      }
    }

    // Try to decode JWT from cookie (if accessible via document.cookie)
    // Note: HttpOnly cookies won't be accessible, but we try anyway
    try {
      const cookies = document.cookie.split(';');
      const jwtCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('jwt=')
      );

      if (jwtCookie) {
        const token = jwtCookie.split('=')[1];
        if (token) {
          try {
            const decoded = jwtDecode<any>(token);
            const role = decoded?.roles?.[0] || decoded?.role;
            if (role && isPanelRole(role)) {
              return role;
            }
          } catch (decodeError) {
            // Token decode failed, continue
          }
        }
      }
    } catch (cookieError) {
      // Cookie access failed (likely HttpOnly), continue
    }

    // Try to get from auth_user in localStorage
    const authUserStr = window.localStorage.getItem('auth_user');
    if (authUserStr) {
      try {
        const authUser = JSON.parse(authUserStr);
        const role =
          authUser?.currentProfile?.role?.name ||
          authUser?.currentProfile?.role_name ||
          authUser?.currentProfile?.role ||
          authUser?.role;

        if (role && isPanelRole(role)) {
          return role;
        }
      } catch (e) {
        // Invalid JSON, continue
      }
    }
  } catch (error) {
    console.error('Error extracting user role:', error);
  }

  return null;
}
