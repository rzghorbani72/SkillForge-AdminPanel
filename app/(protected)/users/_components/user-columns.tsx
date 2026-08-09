'use client';

import { Eye, Pencil, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DataColumn } from '@/components/shared/data-list';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserStatusPill } from '@/components/users/user-status-pill';
import {
  getUserRoleName,
  getUserStatus,
  userTone
} from '@/components/users/user-card';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { InterpolationParams } from '@/lib/i18n';
import type { User } from '@/types/api';

interface BuildUserColumnsArgs {
  t: (key: string, params?: InterpolationParams) => string;
  formatNumber: (value: number) => string;
  canChangeRole: (user: User) => boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onRoleChange: (user: User) => void;
}

export function buildUserColumns({
  t,
  formatNumber,
  canChangeRole,
  onView,
  onEdit,
  onRoleChange
}: BuildUserColumnsArgs): DataColumn<User>[] {
  return [
    {
      id: 'user',
      header: t('users.colUser'),
      cell: (user) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar
            name={user.display_name || user.name}
            tone={userTone(user)}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">
              {user.display_name || user.name || `#${user.id}`}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user.email || user.phone_number || '—'}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'role',
      header: t('users.colRole'),
      cell: (user) => {
        const role = getUserRoleName(user);
        return role ? (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11.5px] font-medium text-primary">
            {getRoleLabel(role, t)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      }
    },
    {
      id: 'phone',
      header: t('users.colPhone'),
      className: 'hidden md:table-cell',
      cell: (user) => (
        <span className="text-muted-foreground" dir="ltr">
          {user.phone_number || '—'}
        </span>
      )
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (user) => <UserStatusPill status={getUserStatus(user)} />
    },
    {
      id: 'actions',
      header: t('users.colActions'),
      align: 'end',
      cell: (user) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            aria-label={t('common.view')}
            onClick={() => onView(user)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            aria-label={t('common.edit')}
            onClick={() => onEdit(user)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {canChangeRole(user) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              aria-label={t('users.colRole')}
              onClick={() => onRoleChange(user)}
            >
              <Shield className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )
    }
  ];
}
