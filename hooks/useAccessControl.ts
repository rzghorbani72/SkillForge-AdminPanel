import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { authService } from '@/lib/auth';

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

export function useAccessControl() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user context from the auth service
      const currentUser = authService.getCurrentUser();

      if (currentUser) {
        // Transform the current user data to match our UserState interface
        const userState: UserState = {
          user_id: currentUser.user.id,
          school_id: currentUser.currentProfile?.school_id || 0,
          role: currentUser.currentProfile?.role?.name || 'STUDENT',
          is_admin: currentUser.currentProfile?.role?.name === 'ADMIN',
          is_manager: currentUser.currentProfile?.role?.name === 'MANAGER',
          is_teacher: currentUser.currentProfile?.role?.name === 'TEACHER',
          is_student: currentUser.currentProfile?.role?.name === 'STUDENT',
          permissions: []
        };

        setUserState(userState);
      } else {
        setUserState(null);
        setError('User not authenticated');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch user state'
      );
      setUserState(null);
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
