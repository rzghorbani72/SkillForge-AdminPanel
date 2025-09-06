'use client';

import { Badge } from '@/components/ui/badge';
import { useAccessControl } from '@/hooks/useAccessControl';
import { User, Users, Shield } from 'lucide-react';

interface OwnershipBadgeProps {
  ownerId?: number;
  schoolId?: number;
  accessControl?: {
    can_modify: boolean;
    can_delete: boolean;
    can_view: boolean;
    is_owner: boolean;
    user_role: string;
    user_permissions: string[];
  };
  className?: string;
  showIcon?: boolean;
}

export default function OwnershipBadge({
  ownerId,
  schoolId,
  accessControl,
  className = '',
  showIcon = true
}: OwnershipBadgeProps) {
  const { userState, checkResourceAccess } = useAccessControl();

  if (!userState) {
    return null;
  }

  // Use backend access control if available, otherwise calculate from frontend
  const resourceAccess = accessControl
    ? {
        canModify: accessControl.can_modify,
        canDelete: accessControl.can_delete,
        canView: accessControl.can_view,
        isOwner: accessControl.is_owner,
        userRole: accessControl.user_role,
        userPermissions: accessControl.user_permissions
      }
    : checkResourceAccess({
        owner_id: ownerId,
        school_id: schoolId
      });

  const isOwner = resourceAccess.isOwner;
  const userRole = resourceAccess.userRole || userState.role;

  // Determine badge variant and content based on ownership and role
  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' =
    'secondary';
  let badgeText = 'Others';
  let icon = <Users className="h-3 w-3" />;

  if (isOwner) {
    badgeVariant = 'default';
    badgeText = 'Yours';
    icon = <User className="h-3 w-3" />;
  } else if (userRole === 'ADMIN') {
    badgeVariant = 'destructive';
    badgeText = 'Admin';
    icon = <Shield className="h-3 w-3" />;
  } else if (userRole === 'MANAGER') {
    badgeVariant = 'outline';
    badgeText = 'Manager';
    icon = <Shield className="h-3 w-3" />;
  }

  return (
    <Badge
      variant={badgeVariant}
      className={`flex items-center gap-1 text-xs ${className}`}
    >
      {showIcon && icon}
      {badgeText}
    </Badge>
  );
}

// Alternative component for different styling
export function OwnershipBadgeSimple({
  ownerId,
  schoolId,
  accessControl,
  className = ''
}: OwnershipBadgeProps) {
  const { userState, checkResourceAccess } = useAccessControl();

  if (!userState) {
    return null;
  }

  const resourceAccess = accessControl
    ? {
        isOwner: accessControl.is_owner
      }
    : checkResourceAccess({
        owner_id: ownerId,
        school_id: schoolId
      });

  const isOwner = resourceAccess.isOwner;

  return (
    <Badge
      variant={isOwner ? 'default' : 'secondary'}
      className={`text-xs ${className}`}
    >
      {isOwner ? 'Yours' : 'Others'}
    </Badge>
  );
}
