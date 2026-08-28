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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [label, setLabel] = useState(role.label);
  const [description, setDescription] = useState(role.description ?? '');
  const { granted, toggle, toggleResource, replace, permissions } =
    usePermissionSelection(role.permissions);

  const levelLabel = getAccessLevelLabel(role.hierarchy_level, t);
  const labelValid = label.trim().length >= 2;

  const save = async () => {
    if (!labelValid) return;
    try {
      setSaving(true);
      await apiClient.updatePlatformRole(role.id, {
        label: label.trim(),
        description: description.trim() || undefined
      });
      await apiClient.setPlatformRolePermissions(role.id, permissions);
      ErrorHandler.showSuccess(t('roles.roleUpdated'));
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
      <DialogContent className="sm:max-w-4xl">
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
          /* An unbounded list gets a bounded box; the dialog itself never scrolls. */
          <div className="max-h-[52vh] overflow-y-auto rounded-lg border border-border/70 p-3">
            <PermissionReadonlyList permissions={role.permissions} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="role-edit-label">{t('roles.labelLabel')}</Label>
                <Input
                  id="role-edit-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
                {label && !labelValid && (
                  <p className="text-xs text-destructive">
                    {t('roles.labelInvalid')}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role-edit-desc">
                  {t('roles.descriptionLabel')}
                </Label>
                <Textarea
                  id="role-edit-desc"
                  className="min-h-[38px]"
                  rows={1}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

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
            {/* A matrix of every resource has no natural size, so it scrolls
                inside its own box rather than making the dialog scroll. */}
            <div className="max-h-[42vh] overflow-y-auto rounded-lg border border-border/70 p-3">
              <PermissionGrid
                resources={catalog.resources}
                granted={granted}
                onToggle={toggle}
                onToggleResource={(resource, grantAll) =>
                  toggleResource(catalog.resources, resource, grantAll)
                }
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {readOnly ? t('common.close') : t('common.cancel')}
          </Button>
          {!readOnly && (
            <Button onClick={save} disabled={saving || !labelValid}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
