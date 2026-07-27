'use client';

import { Shield, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListChips } from '@/components/shared/data-list';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { getRoleMeta } from './role-meta';
import type { PlatformRole } from '@/types/roles';

interface RoleCardProps {
  role: PlatformRole;
  onEdit: (role: PlatformRole) => void;
  onDelete: (role: PlatformRole) => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const meta = getRoleMeta(role, t);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{meta.label}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {role.name}
            </p>
          </div>
        </div>
        <RoleTypeBadge isSystem={role.is_system} />
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {meta.hint}
      </p>

      <div className="mt-3">
        <ListChips labels={meta.resources} max={3} />
      </div>

      <div className="mt-auto space-y-3 pt-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {t('roles.userCount', { count: formatNumber(role.user_count) })}
          </span>
          <span>
            {t('roles.permissionCount', {
              count: formatNumber(role.permissions.length)
            })}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg"
            onClick={() => onEdit(role)}
          >
            {t('roles.editPermissions')}
          </Button>
          {!role.is_system && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              onClick={() => onDelete(role)}
              aria-label={t('roles.deleteRole')}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RoleTypeBadge({ isSystem }: { isSystem: boolean }) {
  const { t } = useTranslation();
  return (
    <span
      className={
        isSystem
          ? 'shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground'
          : 'shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary'
      }
    >
      {isSystem ? t('roles.systemBadge') : t('roles.customBadge')}
    </span>
  );
}
