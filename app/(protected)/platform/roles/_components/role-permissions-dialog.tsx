'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
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
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { PermissionGrid } from './permission-grid';
import { PermissionReadonlyList } from './permission-readonly-list';
import { usePermissionSelection } from './use-permission-selection';
import { getAccessLevelLabel } from './access-levels';
import { defaultsFor } from './level-defaults';
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
  const formatNumber = useNumberFormat();
  const [saving, setSaving] = useState(false);
  const { granted, toggle, toggleResource, replace, permissions } =
    usePermissionSelection(role.permissions);

  const levelLabel = getAccessLevelLabel(role.hierarchy_level, t);

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
              { role: getRoleMeta(role, t, formatNumber).label }
            )}
          </DialogTitle>
          <DialogDescription>
            {readOnly
              ? t(readOnlyReasonKey ?? 'roles.readOnlyNoPermission')
              : t('roles.permissionsHintLevel', { level: levelLabel })}
          </DialogDescription>
        </DialogHeader>

        {readOnly ? (
          <PermissionReadonlyList permissions={role.permissions} />
        ) : (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() =>
                replace(defaultsFor(catalog, role.hierarchy_level))
              }
            >
              <RotateCcw className="me-1.5 h-3.5 w-3.5" />
              {t('roles.applyLevelDefaults', { level: levelLabel })}
            </Button>
            <PermissionGrid
              resources={catalog.resources}
              granted={granted}
              onToggle={toggle}
              onToggleResource={(resource, grantAll) =>
                toggleResource(catalog.resources, resource, grantAll)
              }
            />
          </div>
        )}

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
