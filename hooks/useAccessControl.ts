import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { useAuthUser } from '@/hooks/useAuthUser';

export interface UserState {
  user_id: string;
  academy_id: string;
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

function buildUserState(user: NonNullable<ReturnType<typeof useAuthUser>['user']>): UserState {
  const normalizedRole = user.role.toUpperCase();
  const permissions = [
    ...user.granularPermissions,
    ...(user.profile?.role === 'MANAGER' ? ['manage_courses', 'manage_content'] : []),
  ];

  return {
    user_id: String(user.id),
    academy_id: String(user.academyId ?? user.profile?.academy_id ?? ''),
    role: normalizedRole,
    is_admin: normalizedRole === 'ADMIN' || normalizedRole === 'PLATFORM_OWNER',
    is_manager: normalizedRole === 'MANAGER',
    is_teacher: normalizedRole === 'TEACHER',
    is_student: normalizedRole === 'STUDENT',
    permissions,
  };
}

export function useAccessControl() {
  const { user, isLoading, error, refetch } = useAuthUser();
  const router = useRouter();
  const userState = user ? buildUserState(user) : null;

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!userState) return false;
      if (userState.is_admin) return true;
      return userState.permissions.includes(permission);
    },
    [userState],
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!userState) return false;
      return userState.role === role.toUpperCase();
    },
    [userState],
  );

  const isAdmin = useCallback((): boolean => userState?.is_admin ?? false, [userState]);
  const isManager = useCallback((): boolean => userState?.is_manager ?? false, [userState]);
  const isTeacher = useCallback((): boolean => userState?.is_teacher ?? false, [userState]);
  const isStudent = useCallback((): boolean => userState?.is_student ?? false, [userState]);

  const canManageCourses = useCallback(
    (): boolean => hasPermission('manage_courses') || isAdmin() || isManager(),
    [hasPermission, isAdmin, isManager],
  );

  const canManageContent = useCallback(
    (): boolean => hasPermission('manage_content') || isAdmin() || isManager(),
    [hasPermission, isAdmin, isManager],
  );

  const canModifyResource = useCallback(
    (resourceOwnerId: string, resourceStoreId?: string): boolean => {
      if (!userState) return false;
      if (isAdmin()) return true;
      if (isManager() && resourceStoreId === userState.academy_id) return true;
      if (isTeacher() && resourceOwnerId === userState.user_id) return true;
      return false;
    },
    [userState, isAdmin, isManager, isTeacher],
  );

  const canDeleteResource = useCallback(
    (resourceOwnerId: string, resourceStoreId?: string): boolean =>
      canModifyResource(resourceOwnerId, resourceStoreId),
    [canModifyResource],
  );

  const canViewResource = useCallback(
    (resourceStoreId?: string): boolean => {
      if (!userState) return false;
      if (isAdmin()) return true;
      if ((isManager() || isTeacher()) && resourceStoreId === userState.academy_id) {
        return true;
      }
      return false;
    },
    [userState, isAdmin, isManager, isTeacher],
  );

  const checkResourceAccess = useCallback(
    (resource: {
      owner_id?: string;
      academy_id?: string;
      access_control?: AccessControl;
    }): ResourceAccessControl => {
      if (resource.access_control) {
        return {
          canModify: resource.access_control.can_modify,
          canDelete: resource.access_control.can_delete,
          canView: resource.access_control.can_view,
          isOwner: resource.access_control.is_owner,
          userRole: resource.access_control.user_role,
          userPermissions: resource.access_control.user_permissions,
        };
      }

      const ownerId = resource.owner_id ?? '';
      const academyId = resource.academy_id;

      return {
        canModify: canModifyResource(ownerId, academyId),
        canDelete: canDeleteResource(ownerId, academyId),
        canView: canViewResource(academyId),
        isOwner: ownerId === userState?.user_id,
        userRole: userState?.role || '',
        userPermissions: userState?.permissions || [],
      };
    },
    [canModifyResource, canDeleteResource, canViewResource, userState],
  );

  const requirePermission = useCallback(
    (permission: string, redirectTo: string = '/dashboard') => {
      if (!hasPermission(permission)) {
        toast.error(tNow('toasts.noPermission'));
        router.push(redirectTo);
        return false;
      }
      return true;
    },
    [hasPermission, router],
  );

  const requireRole = useCallback(
    (role: string, redirectTo: string = '/dashboard') => {
      if (!hasRole(role)) {
        toast.error(tNow('toasts.noRole'));
        router.push(redirectTo);
        return false;
      }
      return true;
    },
    [hasRole, router],
  );

  const requireResourceAccess = useCallback(
    (
      resource: {
        owner_id?: string;
        academy_id?: string;
        access_control?: AccessControl;
      },
      action: 'view' | 'modify' | 'delete' = 'view',
      redirectTo: string = '/dashboard',
    ) => {
      const access = checkResourceAccess(resource);
      const allowed =
        action === 'view'
          ? access.canView
          : action === 'modify'
            ? access.canModify
            : access.canDelete;

      if (!allowed) {
        toast.error(tNow('toasts.noPermission'));
        router.push(redirectTo);
        return false;
      }
      return true;
    },
    [checkResourceAccess, router],
  );

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
    refetch,
  };
}
