'use client';

import { useMemo, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { RolePermissionsDialog } from '@/components/roles/role-permissions-dialog';
import { getRoleAbilities } from '@/components/roles/role-access';
import { getRoleMeta } from '@/components/roles/role-meta';
import { sortRoles, useRolesData } from '@/components/roles/use-roles-data';
import type { User } from '@/types/api';

type ChangeRoleDialogProps = {
  user: User | null;
  currentRoleName?: string;
  onClose: () => void;
  onChanged: () => void;
};

export function ChangeRoleDialog({
  user,
  currentRoleName,
  onClose,
  onChanged,
}: ChangeRoleDialogProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { user: authUser } = useAuthUser();
  const { roles, catalog, reload, capLevel, ownLevel } = useRolesData(authUser?.role);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [viewingPermissions, setViewingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeName = selectedName ?? currentRoleName;
  const selectedRole = roles.find((role) => role.name === activeName);
  const sorted = useMemo(() => sortRoles(roles, authUser?.role), [roles, authUser?.role]);
  const abilities = (role: (typeof roles)[number]) =>
    getRoleAbilities(role, authUser, capLevel, ownLevel);

  const close = () => {
    setSelectedName(null);
    setViewingPermissions(false);
    onClose();
  };

  const save = async () => {
    if (!user || !selectedRole) return;
    try {
      setSaving(true);
      await apiClient.assignPlatformRole(selectedRole.id, user.id);
      ErrorHandler.showSuccess(t('roles.roleAssigned'));
      onChanged();
      close();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={!!user && !viewingPermissions} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('users.changeRoleTitle', { name: user?.display_name || user?.name || '' })}
            </DialogTitle>
            <DialogDescription>{t('roles.assignChangeHint')}</DialogDescription>
          </DialogHeader>

          <ul className="max-h-64 space-y-1.5 overflow-y-auto">
            {sorted.map((role) => {
              const meta = getRoleMeta(role, t, formatNumber);
              const isSelected = role.name === activeName;
              const allowed = abilities(role).canAssign || role.name === currentRoleName;
              return (
                <li key={role.id}>
                  <button
                    type="button"
                    disabled={!allowed}
                    onClick={() => setSelectedName(role.name)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-start transition-colors disabled:opacity-50',
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{meta.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {meta.hint}
                      </span>
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              disabled={!selectedRole || !catalog}
              onClick={() => setViewingPermissions(true)}
            >
              <ShieldCheck className="me-1.5 h-4 w-4" />
              {t('users.rolePermissions')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={close} disabled={saving}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={save}
                disabled={saving || !selectedRole || selectedRole.name === currentRoleName}
              >
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {user && viewingPermissions && selectedRole && catalog && (
        <RolePermissionsDialog
          role={selectedRole}
          catalog={catalog}
          open
          onClose={() => setViewingPermissions(false)}
          onSaved={reload}
          readOnly={!abilities(selectedRole).canEdit}
          readOnlyReasonKey={abilities(selectedRole).readOnlyReasonKey}
        />
      )}
    </>
  );
}
