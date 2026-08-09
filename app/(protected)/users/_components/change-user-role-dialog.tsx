'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import {
  MANAGER_HIERARCHY_LEVEL,
  useAssignableRoles
} from '@/hooks/use-assignable-roles';
import { User } from '@/types/api';

interface ChangeUserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

/**
 * Gives a user any role valid in the academy — the built-in roles up to the
 * caller's own rank plus the academy's custom roles. The list comes from the
 * server, which scopes it to the caller's academy and rank.
 */
export function ChangeUserRoleDialog({
  open,
  onOpenChange,
  user,
  onSuccess
}: ChangeUserRoleDialogProps) {
  const { t } = useTranslation();
  const { roles, loading } = useAssignableRoles(open);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentRoleName = user?.role_name ?? user?.profiles?.[0]?.role?.name;

  useEffect(() => {
    if (!open) setSelectedRoleId('');
  }, [open]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const usesSeat =
    (selectedRole?.hierarchy_level ?? 0) >= MANAGER_HIERARCHY_LEVEL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRole) return;

    try {
      setIsSaving(true);
      const result = await apiClient.assignPlatformRole(
        selectedRole.id,
        user.id
      );
      ErrorHandler.showSuccess(
        t(result.changed ? 'roles.roleAssigned' : 'roles.roleAlreadyAssigned')
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('changeUserRole.title')}</DialogTitle>
          <DialogDescription>
            {t('changeUserRole.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('changeUserRole.currentRole')}</Label>
            <div className="text-sm text-muted-foreground">
              {user.role_label || getRoleLabel(currentRoleName, t)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('changeUserRole.newRole')} *</Label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isSaving || loading}
            >
              <SelectTrigger id="role">
                <SelectValue
                  placeholder={
                    loading
                      ? t('common.loading')
                      : t('changeUserRole.selectRole')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {usesSeat && (
            <p className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t('roles.assignSeatWarning')}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSaving || !selectedRole}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('changeUserRole.changeRole')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
