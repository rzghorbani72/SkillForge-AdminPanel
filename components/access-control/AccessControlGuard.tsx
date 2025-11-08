'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';

interface AccessControlGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  resource?: {
    owner_id?: number;
    school_id?: number;
    access_control?: {
      can_modify: boolean;
      can_delete: boolean;
      can_view: boolean;
      is_owner: boolean;
      user_role: string;
      user_permissions: string[];
    };
  };
  action?: 'view' | 'modify' | 'delete';
  fallbackPath?: string;
  showFallback?: boolean;
  fallbackMessage?: string;
}

export default function AccessControlGuard({
  children,
  requiredPermission,
  requiredRole,
  resource,
  action = 'view',
  fallbackPath = '/dashboard',
  showFallback = true,
  fallbackMessage
}: AccessControlGuardProps) {
  const {
    userState,
    isLoading,
    hasPermission,
    hasRole,
    canManageCourses,
    checkResourceAccess,
    requirePermission,
    requireRole,
    requireResourceAccess
  } = useAccessControl();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!userState && !resource?.access_control) return;

    try {
      let access = true;

      const ownerIdFromResource =
        resource?.owner_id ??
        (resource as any)?.author?.user_id ??
        (resource as any)?.author_id ??
        (resource as any)?.user_id ??
        null;

      const resourceAccess = resource
        ? resource.access_control
          ? {
              canModify: resource.access_control.can_modify,
              canDelete: resource.access_control.can_delete,
              canView: resource.access_control.can_view,
              isOwner: resource.access_control.is_owner,
              userRole: resource.access_control.user_role,
              userPermissions: resource.access_control.user_permissions || []
            }
          : checkResourceAccess(resource)
        : null;

      const isOwner =
        resourceAccess?.isOwner ||
        (ownerIdFromResource !== null &&
          userState?.user_id === Number(ownerIdFromResource)) ||
        false;
      const roleAllowsCourseManagement =
        resourceAccess?.userRole === 'ADMIN' ||
        resourceAccess?.userRole === 'MANAGER' ||
        (resourceAccess?.userRole === 'TEACHER' &&
          resourceAccess?.userPermissions?.includes('manage_courses')) ||
        resourceAccess?.userPermissions?.includes('manage_courses') ||
        resourceAccess?.userPermissions?.includes('modify_own_data');

      const hasBackendAccess =
        !userState &&
        resourceAccess &&
        (resourceAccess.canModify ||
          resourceAccess.canView ||
          resourceAccess.canDelete ||
          isOwner ||
          roleAllowsCourseManagement);

      if (hasBackendAccess) {
        setHasAccess(true);
        setAccessError(null);
        return;
      }

      // Check permission requirement
      if (requiredPermission && !hasPermission(requiredPermission)) {
        access = false;
        setAccessError(
          `You need the "${requiredPermission}" permission to access this resource.`
        );
      }

      // Check role requirement
      if (requiredRole && !hasRole(requiredRole)) {
        access = false;
        setAccessError(
          `You need the "${requiredRole}" role to access this resource.`
        );
      }

      // For modify/delete actions without specific permissions, check if user can manage courses
      if (
        (action === 'modify' || action === 'delete') &&
        !requiredPermission &&
        !requiredRole
      ) {
        if (resourceAccess) {
          const canPerform =
            action === 'modify'
              ? resourceAccess.canModify ||
                isOwner ||
                roleAllowsCourseManagement
              : resourceAccess.canDelete ||
                isOwner ||
                roleAllowsCourseManagement;
          if (!canPerform) {
            access = false;
            setAccessError(
              `You do not have permission to ${action} this resource.`
            );
          }
        } else if (!canManageCourses()) {
          access = false;
          setAccessError(
            'You need course management permissions to perform this action.'
          );
        }
      }

      // Check resource-specific access
      if (resourceAccess) {
        switch (action) {
          case 'view':
            if (
              !resourceAccess.canView &&
              !isOwner &&
              !roleAllowsCourseManagement
            ) {
              access = false;
              setAccessError(
                'You do not have permission to view this resource.'
              );
            }
            break;
          case 'modify':
            if (
              !resourceAccess.canModify &&
              !isOwner &&
              !roleAllowsCourseManagement
            ) {
              access = false;
              setAccessError(
                'You do not have permission to modify this resource.'
              );
            }
            break;
          case 'delete':
            if (
              !resourceAccess.canDelete &&
              !isOwner &&
              !roleAllowsCourseManagement
            ) {
              access = false;
              setAccessError(
                'You do not have permission to delete this resource.'
              );
            }
            break;
        }
      }

      setHasAccess(access);

      // Redirect if no access and not showing fallback
      if (!access && !showFallback) {
        if (requiredPermission) {
          requirePermission(requiredPermission, fallbackPath);
        } else if (requiredRole) {
          requireRole(requiredRole, fallbackPath);
        } else if (resource) {
          requireResourceAccess(resource, action, fallbackPath);
        } else {
          router.push(fallbackPath);
        }
      }
    } catch (error) {
      console.error('Access control check failed:', error);
      setAccessError('Failed to verify access permissions.');
      setHasAccess(false);
    }
  }, [
    isLoading,
    userState,
    requiredPermission,
    requiredRole,
    resource,
    action,
    hasPermission,
    hasRole,
    checkResourceAccess,
    requirePermission,
    requireRole,
    requireResourceAccess,
    showFallback,
    fallbackPath,
    router
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if no access
  if (hasAccess === false) {
    if (!showFallback) {
      return null; // Will redirect
    }

    return (
      <div className="container mx-auto py-6">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {fallbackMessage ||
                accessError ||
                'You do not have permission to access this resource.'}
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => router.push(fallbackPath)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show children if access is granted
  if (hasAccess === true) {
    return <>{children}</>;
  }

  // Default loading state
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Higher-order component for easier usage
export function withAccessControl<P extends object>(
  Component: React.ComponentType<P>,
  accessControlProps: Omit<AccessControlGuardProps, 'children'>
) {
  return function AccessControlledComponent(props: P) {
    return (
      <AccessControlGuard {...accessControlProps}>
        <Component {...props} />
      </AccessControlGuard>
    );
  };
}
