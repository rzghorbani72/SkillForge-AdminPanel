'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { DataList, DataPanel } from '@/components/shared/data-list';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { hasPermission } from '@/lib/permissions';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { PermissionCatalog, PlatformRole } from '@/types/roles';
import { RolePermissionsDialog } from './role-permissions-dialog';
import { CreateRoleDialog } from './create-role-dialog';
import { RoleCard } from './role-card';
import { buildRoleColumns } from './role-columns';

// A non-owner actor's creation ceiling: the named reference role whose
// hierarchy_level bounds what they may create (mirrors the backend's
// ROLE_CREATION_CAP in Backend/src/roles/permission-catalog.ts).
const CREATION_CAP_ROLE: Record<string, string> = {
  ADMIN: 'MANAGER',
  MANAGER: 'TEACHER'
};

export function RolesManager() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { user } = useAuthUser();
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PlatformRole | null>(null);
  const [deleting, setDeleting] = useState<PlatformRole | null>(null);

  const canCreate = hasPermission(user, 'roles', 'write');
  const capRoleName = user?.role ? CREATION_CAP_ROLE[user.role] : undefined;
  const maxLevel = capRoleName
    ? roles.find((r) => r.name === capRoleName)?.hierarchy_level
    : 5; // PLATFORM_OWNER (no cap role) — DTO's own ceiling for custom roles.

  const load = async () => {
    try {
      setLoading(true);
      const [rolesRes, catalogRes] = await Promise.all([
        apiClient.getPlatformRoles(),
        apiClient.getPermissionCatalog()
      ]);
      setRoles(rolesRes.roles);
      setCatalog(catalogRes);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiClient.deletePlatformRole(deleting.id);
      ErrorHandler.showSuccess(t('roles.roleDeleted'));
      setDeleting(null);
      load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const columns = useMemo(
    () =>
      buildRoleColumns({
        t,
        formatNumber,
        onEdit: setEditing,
        onDelete: setDeleting
      }),
    [t, formatNumber]
  );

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => b.hierarchy_level - a.hierarchy_level),
    [roles]
  );

  const summary = useMemo(() => {
    const system = roles.filter((r) => r.is_system).length;
    const assigned = roles.reduce((sum, r) => sum + r.user_count, 0);
    return [
      `${formatNumber(roles.length)} ${t('roles.statTotal')}`,
      `${formatNumber(system)} ${t('roles.statSystem')}`,
      `${formatNumber(roles.length - system)} ${t('roles.statCustom')}`,
      `${formatNumber(assigned)} ${t('roles.statAssigned')}`
    ].join(' · ');
  }, [roles, formatNumber, t]);

  return (
    <div className="space-y-5">
      <DataPanel
        title={t('roles.listTitle')}
        subtitle={loading ? t('roles.listSubtitle') : summary}
        actions={
          canCreate ? (
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() => setCreating(true)}
            >
              <Plus className="me-1.5 h-4 w-4" />
              {t('roles.addRole')}
            </Button>
          ) : null
        }
      >
        <DataList
          items={sortedRoles}
          columns={columns}
          rowKey={(role) => role.id}
          isLoading={loading}
          renderCard={(role) => (
            <RoleCard role={role} onEdit={setEditing} onDelete={setDeleting} />
          )}
          emptyState={
            <div className="py-12">
              <EmptyState
                icon={<Shield className="h-10 w-10" />}
                title={t('roles.emptyTitle')}
                description={t('roles.emptyDesc')}
              />
            </div>
          }
        />
      </DataPanel>

      <CreateRoleDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={load}
        maxLevel={maxLevel}
      />

      {editing && catalog && (
        <RolePermissionsDialog
          role={editing}
          catalog={catalog}
          open={!!editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleting}
        title={t('roles.deleteTitle')}
        description={t('roles.deleteConfirm', {
          role: deleting ? getRoleLabel(deleting.name, t) : ''
        })}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        confirmLabel={t('roles.deleteRole')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  );
}
