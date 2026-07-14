'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type {
  PermissionCatalog,
  PlatformRole,
  RolePermission
} from '@/types/roles';

interface Props {
  role: PlatformRole;
  catalog: PermissionCatalog;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const keyOf = (resource: string, action: string) => `${resource}:${action}`;

export function RolePermissionsDialog({
  role,
  catalog,
  open,
  onClose,
  onSaved
}: Props) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [granted, setGranted] = useState<Set<string>>(
    () => new Set(role.permissions.map((p) => keyOf(p.resource, p.action)))
  );

  const locked = role.name === 'PLATFORM_OWNER';

  const toggle = (resource: string, action: string) => {
    const key = keyOf(resource, action);
    setGranted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const permissions = useMemo<RolePermission[]>(
    () =>
      Array.from(granted).map((k) => {
        const [resource, action] = k.split(':');
        return { resource, action };
      }),
    [granted]
  );

  const save = async () => {
    try {
      setSaving(true);
      await apiClient.setPlatformRolePermissions(role.id, permissions);
      ErrorHandler.showSuccess(t('roles.permissionsSaved'));
      onSaved();
      onClose();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('roles.editPermissionsFor', { role: role.label })}
          </DialogTitle>
          <DialogDescription>
            {locked ? t('roles.ownerLockedHint') : t('roles.permissionsHint')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {catalog.resources.map((entry) => (
            <div
              key={entry.resource}
              className="flex items-center justify-between gap-4 rounded-md border p-3"
            >
              <span className="text-sm font-medium">
                {t(`roles.resource.${entry.resource}`)}
              </span>
              <div className="flex items-center gap-4">
                {entry.actions.map((action) => {
                  const key = keyOf(entry.resource, action);
                  return (
                    <label
                      key={action}
                      className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground"
                    >
                      <Checkbox
                        checked={granted.has(key)}
                        disabled={locked}
                        onCheckedChange={() => toggle(entry.resource, action)}
                      />
                      {t(`roles.action.${action}`)}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={save} disabled={saving || locked}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
