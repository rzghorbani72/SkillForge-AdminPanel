'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { User, Shield, Eye, Edit, Trash2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccessControl {
  can_modify: boolean;
  can_delete: boolean;
  can_view: boolean;
  is_owner: boolean;
  user_role: string;
  user_permissions: string[];
}

interface AccessControlBadgeProps {
  accessControl: AccessControl;
  className?: string;
  showDetails?: boolean;
}

export function AccessControlBadge({
  accessControl,
  className,
  showDetails = false
}: AccessControlBadgeProps) {
  const { t } = useTranslation();
  const { is_owner, can_modify, can_delete } = accessControl;

  // Determine badge variant and content based on ownership and permissions
  const getBadgeConfig = () => {
    if (is_owner) {
      return {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <User className="h-3 w-3" />,
        text: t('accessControl.ownerBadge'),
        tooltip: t('accessControl.ownerHint')
      };
    }

    if (can_modify && can_delete) {
      return {
        variant: 'secondary' as const,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Shield className="h-3 w-3" />,
        text: t('accessControl.managerBadge'),
        tooltip: t('accessControl.managerHint')
      };
    }

    if (can_modify) {
      return {
        variant: 'outline' as const,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Edit className="h-3 w-3" />,
        text: t('accessControl.canEditBadge'),
        tooltip: t('accessControl.canEditHint')
      };
    }

    return {
      variant: 'outline' as const,
      className: 'bg-muted text-muted-foreground border-border',
      icon: <Eye className="h-3 w-3" />,
      text: t('accessControl.viewOnlyBadge'),
      tooltip: t('accessControl.viewOnlyHint')
    };
  };

  const config = getBadgeConfig();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Badge
        variant={config.variant}
        className={cn('flex items-center gap-1 text-xs', config.className)}
        title={config.tooltip}
      >
        {config.icon}
        <span>{config.text}</span>
      </Badge>

      {showDetails && (
        <div className="flex items-center gap-1">
          {can_modify && (
            <Badge
              variant="outline"
              className="bg-green-50 text-xs text-green-700"
            >
              <Edit className="me-1 h-2 w-2" />
              {t('common.edit')}
            </Badge>
          )}
          {can_delete && (
            <Badge variant="outline" className="bg-red-50 text-xs text-red-700">
              <Trash2 className="me-1 h-2 w-2" />
              {t('common.delete')}
            </Badge>
          )}
          {!can_modify && !can_delete && (
            <Badge
              variant="outline"
              className="bg-muted/50 text-xs text-muted-foreground"
            >
              <Lock className="me-1 h-2 w-2" />
              {t('accessControl.readOnly')}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Permission-based action buttons component
interface AccessControlActionsProps {
  accessControl: AccessControl;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  className?: string;
}

export function AccessControlActions({
  accessControl,
  onEdit,
  onDelete,
  onView,
  className
}: AccessControlActionsProps) {
  const { can_modify, can_delete, can_view } = accessControl;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {can_view && onView && (
        <button
          onClick={onView}
          className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-800"
        >
          <Eye className="h-3 w-3" />
          <span>View</span>
        </button>
      )}

      {can_modify && onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 hover:text-green-800"
        >
          <Edit className="h-3 w-3" />
          <span>Edit</span>
        </button>
      )}

      {can_delete && onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-800"
        >
          <Trash2 className="h-3 w-3" />
          <span>Delete</span>
        </button>
      )}
    </div>
  );
}
