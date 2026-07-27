'use client';

import { Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListChips, type DataColumn } from '@/components/shared/data-list';
import { RoleTypeBadge } from './role-card';
import { getRoleMeta } from './role-meta';
import type { InterpolationParams } from '@/lib/i18n';
import type { PlatformRole } from '@/types/roles';

interface BuildRoleColumnsArgs {
  t: (key: string, params?: InterpolationParams) => string;
  formatNumber: (value: number) => string;
  onEdit: (role: PlatformRole) => void;
  onDelete: (role: PlatformRole) => void;
}

export function buildRoleColumns({
  t,
  formatNumber,
  onEdit,
  onDelete
}: BuildRoleColumnsArgs): DataColumn<PlatformRole>[] {
  return [
    {
      id: 'role',
      header: t('roles.colRole'),
      cell: (role) => {
        const meta = getRoleMeta(role, t);
        return (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-tight">{meta.label}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {role.name}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      id: 'hint',
      header: t('common.description'),
      className: 'hidden max-w-[280px] lg:table-cell',
      cell: (role) => (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {getRoleMeta(role, t).hint}
        </span>
      )
    },
    {
      id: 'type',
      header: t('roles.colType'),
      cell: (role) => <RoleTypeBadge isSystem={role.is_system} />
    },
    {
      id: 'level',
      header: t('roles.colLevel'),
      className: 'hidden sm:table-cell',
      cell: (role) => (
        <span className="text-muted-foreground">
          {t('roles.levelValue', {
            level: formatNumber(role.hierarchy_level)
          })}
        </span>
      )
    },
    {
      id: 'users',
      header: t('roles.colUsers'),
      cell: (role) => (
        <span className="font-medium">{formatNumber(role.user_count)}</span>
      )
    },
    {
      id: 'access',
      header: t('roles.colAccess'),
      className: 'hidden md:table-cell',
      cell: (role) => {
        const meta = getRoleMeta(role, t);
        if (meta.resources.length === 0) {
          return (
            <span className="text-xs text-muted-foreground">
              {t('roles.noAccess')}
            </span>
          );
        }
        return <ListChips labels={meta.resources} max={2} />;
      }
    },
    {
      id: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (role) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs"
            onClick={() => onEdit(role)}
          >
            {t('roles.editPermissions')}
          </Button>
          {!role.is_system && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => onDelete(role)}
              aria-label={t('roles.deleteRole')}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      )
    }
  ];
}
