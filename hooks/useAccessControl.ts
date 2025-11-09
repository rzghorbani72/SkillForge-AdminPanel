import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorHandler } from '@/lib/error-handler';
import { authService, AuthUser } from '@/lib/auth';
import { Profile } from '@/types/api';

export interface UserState {
  user_id: number;
  school_id: number;
  role: string;
  is_admin: boolean;
  is_manager: boolean;
  is_teacher: boolean;
  is_student: boolean;
  permissions: string[];
}

export interface AccessControl {
  can_modify: boolean;
  can_delete: boolean;
  can_view: boolean;
  is_owner: boolean;
  user_role: string;
  user_permissions: string[];
}

export interface ResourceAccessControl {
  canModify: boolean;
  canDelete: boolean;
  canView: boolean;
  isOwner: boolean;
  userRole: string;
  userPermissions: string[];
}

const normalizePermissionArray = (permissions: unknown): string[] => {
  if (!permissions) return [];
  if (!Array.isArray(permissions)) return [];

  return permissions
    .map((permission) => {
      if (!permission) return null;
      if (typeof permission === 'string') return permission;
      if (typeof permission === 'object') {
        if (
          'name' in permission &&
          typeof (permission as any).name === 'string'
        ) {
          return (permission as any).name as string;
        }
        if (
          'permission' in permission &&
          typeof (permission as any).permission === 'string'
        ) {
          return (permission as any).permission as string;
        }
      }
      return null;
    })
    .filter((permission): permission is string => Boolean(permission));
};

const restoreUserFromStorage = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storedUser = window.localStorage.getItem('user_data');
    const storedProfile = window.localStorage.getItem('current_profile');
    const storedSchool = window.localStorage.getItem('current_school');
    const storedPermissions = window.localStorage.getItem('user_permissions');
    const accessToken = window.localStorage.getItem('auth_token') || '';

    if (
      !storedUser ||
      storedUser === 'undefined' ||
      !storedProfile ||
      storedProfile === 'undefined' ||
      !accessToken
    ) {
      return null;
    }

    const user = JSON.parse(storedUser);
    const currentProfile = JSON.parse(storedProfile) as Profile;
    const currentSchool = storedSchool ? JSON.parse(storedSchool) : undefined;
    const permissionSource = storedPermissions
      ? JSON.parse(storedPermissions)
      : (currentProfile as any)?.permissions ||
        (currentProfile?.role as any)?.permissions ||
        [];

    const restoredUser: AuthUser = {
      user,
      access_token: accessToken,
      currentProfile,
      currentSchool,
      permissions: normalizePermissionArray(permissionSource)
    };

    authService.setCurrentUser(restoredUser);
    return restoredUser;
  } catch (error) {
    console.error('Failed to restore auth data from storage', error);
    return null;
  }
};

export function useAccessControl() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  const fetchUserState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user context from the auth service
      let currentUser = authService.getCurrentUser();

      if (!currentUser) {
        currentUser = restoreUserFromStorage();
      }

      if (currentUser) {
        // Transform the current user data to match our UserState interface
        const derivedPermissions =
          currentUser.permissions && currentUser.permissions.length > 0
            ? currentUser.permissions
            : normalizePermissionArray(
                (currentUser.currentProfile as any)?.permissions ||
                  (currentUser.currentProfile?.role as any)?.permissions ||
                  []
              );

        const currentProfileSchoolId =
          (currentUser.currentProfile as any)?.school_id ??
          (currentUser.currentProfile as any)?.schoolId ??
          currentUser.currentSchool?.id ??
          0;

        const roleName =
          (currentUser.currentProfile as any)?.role?.name ||
          (currentUser.currentProfile as any)?.role_name ||
          (currentUser.currentProfile as any)?.role ||
          (currentUser as any)?.role ||
          'STUDENT';

        const userState: UserState = {
          user_id: currentUser.user.id,
          school_id: currentProfileSchoolId,
          role: roleName,
          is_admin: roleName === 'ADMIN',
          is_manager: roleName === 'MANAGER',
          is_teacher: roleName === 'TEACHER',
          is_student: roleName === 'STUDENT',
          permissions: derivedPermissions
        };

        setUserState(userState);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('user_state', JSON.stringify(userState));
        }
      } else {
        if (typeof window !== 'undefined') {
          const cachedState = window.localStorage.getItem('user_state');
          if (cachedState) {
            try {
              const parsed = JSON.parse(cachedState) as UserState;
              setUserState(parsed);
              setError(null);
              setIsLoading(false);
              return;
            } catch {
              window.localStorage.removeItem('user_state');
            }
          }
        }

        setUserState(null);
        setError('User not authenticated');
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          router.replace('/login');
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch user state'
      );
      if (typeof window !== 'undefined') {
        const cachedState = window.localStorage.getItem('user_state');
        if (cachedState) {
          try {
            const parsed = JSON.parse(cachedState) as UserState;
            setUserState(parsed);
            setIsLoading(false);
            return;
          } catch {
            window.localStorage.removeItem('user_state');
          }
        }
      }

      setUserState(null);
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace('/login');
      }
      // Don't redirect automatically, let the component handle it
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserState();
  }, [fetchUserState]);

  const hasPermission = (permission: string): boolean => {
    if (!userState) return false;
    return userState.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!userState) return false;
    return userState.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  const isManager = (): boolean => {
    return hasRole('MANAGER');
  };

  const isTeacher = (): boolean => {
    return hasRole('TEACHER');
  };

  const isStudent = (): boolean => {
    return hasRole('STUDENT');
  };

  const canManageCourses = (): boolean => {
    return hasPermission('manage_courses') || isAdmin() || isManager();
  };

  const canManageContent = (): boolean => {
    return hasPermission('manage_content') || isAdmin() || isManager();
  };

  const canModifyResource = (
    resourceOwnerId: number,
    resourceSchoolId?: number
  ): boolean => {
    if (!userState) return false;

    // Admin can modify everything
    if (isAdmin()) return true;

    // Manager can modify everything in their school
    if (isManager() && resourceSchoolId === userState.school_id) return true;

    // Teacher can only modify their own resources
    if (isTeacher() && resourceOwnerId === userState.user_id) return true;

    return false;
  };

  const canDeleteResource = (
    resourceOwnerId: number,
    resourceSchoolId?: number
  ): boolean => {
    return canModifyResource(resourceOwnerId, resourceSchoolId);
  };

  const canViewResource = (resourceSchoolId?: number): boolean => {
    if (!userState) return false;

    // Admin can view everything
    if (isAdmin()) return true;

    // Manager and Teacher can view everything in their school
    if (
      (isManager() || isTeacher()) &&
      resourceSchoolId === userState.school_id
    )
      return true;

    return false;
  };

  const checkResourceAccess = (resource: {
    owner_id?: number;
    school_id?: number;
    access_control?: AccessControl;
  }): ResourceAccessControl => {
    if (resource.access_control) {
      // Use backend-provided access control
      return {
        canModify: resource.access_control.can_modify,
        canDelete: resource.access_control.can_delete,
        canView: resource.access_control.can_view,
        isOwner: resource.access_control.is_owner,
        userRole: resource.access_control.user_role,
        userPermissions: resource.access_control.user_permissions
      };
    }

    // Fallback to frontend calculation
    const ownerId = resource.owner_id || 0;
    const schoolId = resource.school_id;

    return {
      canModify: canModifyResource(ownerId, schoolId),
      canDelete: canDeleteResource(ownerId, schoolId),
      canView: canViewResource(schoolId),
      isOwner: ownerId === userState?.user_id,
      userRole: userState?.role || '',
      userPermissions: userState?.permissions || []
    };
  };

  const requirePermission = (
    permission: string,
    redirectTo: string = '/dashboard'
  ) => {
    if (!hasPermission(permission)) {
      ErrorHandler.showWarning(
        'You do not have permission to access this resource'
      );
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  const requireRole = (role: string, redirectTo: string = '/dashboard') => {
    if (!hasRole(role)) {
      ErrorHandler.showWarning(
        'You do not have the required role to access this resource'
      );
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  const requireResourceAccess = (
    resource: {
      owner_id?: number;
      school_id?: number;
      access_control?: AccessControl;
    },
    action: 'view' | 'modify' | 'delete' = 'view',
    redirectTo: string = '/dashboard'
  ) => {
    const access = checkResourceAccess(resource);

    let hasAccess = false;
    switch (action) {
      case 'view':
        hasAccess = access.canView;
        break;
      case 'modify':
        hasAccess = access.canModify;
        break;
      case 'delete':
        hasAccess = access.canDelete;
        break;
    }

    if (!hasAccess) {
      ErrorHandler.showWarning(
        'You do not have permission to access this resource'
      );
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  return {
    userState,
    isLoading,
    error,
    hasPermission,
    hasRole,
    isAdmin,
    isManager,
    isTeacher,
    isStudent,
    canManageCourses,
    canManageContent,
    canModifyResource,
    canDeleteResource,
    canViewResource,
    checkResourceAccess,
    requirePermission,
    requireRole,
    requireResourceAccess,
    refetch: fetchUserState
  };
}
