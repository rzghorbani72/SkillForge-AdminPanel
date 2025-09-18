import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessControl } from './useAccessControl';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

interface ResourceAccessOptions {
  resourceId: number;
  resourceType: 'course' | 'season' | 'lesson';
  action?: 'view' | 'modify' | 'delete';
  redirectOnDeny?: boolean;
  fallbackPath?: string;
}

export function useResourceAccess({
  resourceId,
  resourceType,
  action = 'view',
  redirectOnDeny = true,
  fallbackPath = '/dashboard'
}: ResourceAccessOptions) {
  const [resource, setResource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const router = useRouter();
  const { checkResourceAccess, requireResourceAccess } = useAccessControl();

  useEffect(() => {
    if (resourceId) {
      fetchResource();
    }
  }, [resourceId, resourceType]);

  const fetchResource = async () => {
    try {
      setIsLoading(true);
      setAccessError(null);

      let response;
      switch (resourceType) {
        case 'course':
          response = await apiClient.getCourse(resourceId);
          break;
        case 'season':
          response = await apiClient.getSeason(resourceId);
          break;
        case 'lesson':
          response = await apiClient.getLesson(resourceId);
          break;
        default:
          throw new Error(`Unknown resource type: ${resourceType}`);
      }

      if (!response) {
        throw new Error(`${resourceType} not found`);
      }

      setResource(response);

      // Check access control
      const access = checkResourceAccess(response);

      let canAccess = false;
      switch (action) {
        case 'view':
          canAccess = access.canView;
          break;
        case 'modify':
          canAccess = access.canModify;
          break;
        case 'delete':
          canAccess = access.canDelete;
          break;
      }

      setHasAccess(canAccess);

      if (!canAccess && redirectOnDeny) {
        ErrorHandler.showWarning(
          `You do not have permission to ${action} this ${resourceType}`
        );
        requireResourceAccess(response, action, fallbackPath);
      }
    } catch (error) {
      console.error(`Error fetching ${resourceType}:`, error);
      setAccessError(
        error instanceof Error
          ? error.message
          : `Failed to fetch ${resourceType}`
      );
      setHasAccess(false);

      if (redirectOnDeny) {
        ErrorHandler.handleApiError(error);
        router.push(fallbackPath);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkAccess = (newAction?: 'view' | 'modify' | 'delete') => {
    if (!resource) return false;

    const access = checkResourceAccess(resource);
    const actionToCheck = newAction || action;

    switch (actionToCheck) {
      case 'view':
        return access.canView;
      case 'modify':
        return access.canModify;
      case 'delete':
        return access.canDelete;
      default:
        return false;
    }
  };

  const requireAccess = (newAction?: 'view' | 'modify' | 'delete') => {
    if (!resource) return false;

    const actionToCheck = newAction || action;
    return requireResourceAccess(resource, actionToCheck, fallbackPath);
  };

  return {
    resource,
    isLoading,
    hasAccess,
    accessError,
    checkAccess,
    requireAccess,
    refetch: fetchResource
  };
}
