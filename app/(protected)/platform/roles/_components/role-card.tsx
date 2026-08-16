'use client';

import { Eye, Shield, Trash2, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { getAccessLevelLabel } from './access-levels';
import { getRoleMeta } from './role-meta';
import { RoleCardBadges } from './role-card-badges';
import type { RoleAbilities } from './role-access';
import type { PlatformRole } from '@/types/roles';

interface RoleCardProps {
  role: PlatformRole;
  abilities: RoleAbilities;
  isOwnRole: boolean;
  onOpenPermissions: (role: PlatformRole) => void;
  onAssign: (role: PlatformRole) => void;
  onDelete: (role: PlatformRole) => void;
}

export function RoleCard({
  role,
  abilities,
  isOwnRole,
  onOpenPermissions,
  onAssign,
  onDelete
}: RoleCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const meta = getRoleMeta(role, t, formatNumber);
  const inUse = role.user_count > 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{meta.label}</p>
            {!role.is_system && (
              <p className="truncate text-[11px] text-muted-foreground">
                {role.name}
              </p>
            )}
          </div>
        </div>
        <RoleCardBadges role={role} isOwnRole={isOwnRole} />
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {meta.hint}
      </p>

      <p className="mt-3 inline-flex w-fit rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {t('roles.cardLevel', {
          level: getAccessLevelLabel(role.hierarchy_level, t)
        })}
      </p>

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

        {!abilities.canEdit && abilities.readOnlyReasonKey && (
          <p className="text-[11px] text-muted-foreground">
            {t(abilities.readOnlyReasonKey)}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg"
            onClick={() => onOpenPermissions(role)}
          >
            {abilities.canEdit ? (
              t('roles.editPermissions')
            ) : (
              <>
                <Eye className="me-1.5 h-3.5 w-3.5" />
                {t('roles.viewPermissions')}
              </>
            )}
          </Button>

          {abilities.canAssign && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-lg"
              onClick={() => onAssign(role)}
              aria-label={t('roles.assignAction')}
              title={t('roles.assignAction')}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}

          {abilities.canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              disabled={inUse}
              onClick={() => onDelete(role)}
              aria-label={t('roles.deleteRole')}
              title={
                inUse ? t('roles.deleteBlockedInUse') : t('roles.deleteRole')
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
