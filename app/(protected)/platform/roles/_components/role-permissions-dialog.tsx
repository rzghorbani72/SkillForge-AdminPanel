'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { PermissionGrid } from './permission-grid';
import { usePermissionSelection } from './use-permission-selection';
import { getRoleMeta } from './role-meta';
import type { PermissionCatalog, PlatformRole } from '@/types/roles';

interface Props {
  role: PlatformRole;
  catalog: PermissionCatalog;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** View-only: the server would reject a save from this user for this role. */
  readOnly?: boolean;
  /** i18n key telling the user why it is view-only. */
  readOnlyReasonKey?: string;
}

export function RolePermissionsDialog({
  role,
  catalog,
  open,
  onClose,
  onSaved,
  readOnly = false,
  readOnlyReasonKey
}: Props) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const { granted, toggle, toggleResource, permissions } =
    usePermissionSelection(role.permissions);

  // A read-only viewer sees every resource, not just the ones they could grant.
  const resources = readOnly ? buildFullGrid(role, catalog) : catalog.resources;

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
            {t(
              readOnly
                ? 'roles.viewPermissionsFor'
                : 'roles.editPermissionsFor',
              { role: getRoleMeta(role, t).label }
            )}
          </DialogTitle>
          <DialogDescription>
            {readOnly
              ? t(readOnlyReasonKey ?? 'roles.readOnlyNoPermission')
              : t('roles.permissionsHint')}
          </DialogDescription>
        </DialogHeader>

        <PermissionGrid
          resources={resources}
          granted={granted}
          onToggle={toggle}
          onToggleResource={(resource, grantAll) =>
            toggleResource(resources, resource, grantAll)
          }
          readOnly={readOnly}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {readOnly ? t('common.close') : t('common.cancel')}
          </Button>
          {!readOnly && (
            <Button onClick={save} disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The catalog is trimmed to what the viewer may grant, so a read-only viewer
 * would otherwise not see the grants their own role has outside that set.
 * Merge the role's own permissions back in so the view is the whole truth.
 */
function buildFullGrid(role: PlatformRole, catalog: PermissionCatalog) {
  const actionsByResource = new Map<string, Set<string>>();
  for (const entry of catalog.resources) {
    actionsByResource.set(entry.resource, new Set(entry.actions));
  }
  for (const permission of role.permissions) {
    const actions = actionsByResource.get(permission.resource) ?? new Set();
    actions.add(permission.action);
    actionsByResource.set(permission.resource, actions);
  }
  return Array.from(actionsByResource.entries()).map(([resource, actions]) => ({
    resource,
    actions: Array.from(actions) as CatalogAction[]
  }));
}

type CatalogAction = PermissionCatalog['resources'][number]['actions'][number];
