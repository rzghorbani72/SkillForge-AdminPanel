'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { DataList, DataPanel } from '@/components/shared/data-list';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { hasPermission } from '@/lib/permissions';
import type { PlatformRole } from '@/types/roles';
import { RolePermissionsDialog } from './role-permissions-dialog';
import { CreateRoleDialog } from './create-role-dialog';
import { AssignRoleDialog } from './assign-role-dialog';
import { RoleCard } from './role-card';
import { getRoleAbilities } from './role-access';
import { getRoleMeta } from './role-meta';
import { sortRoles, useRolesData } from './use-roles-data';

export function RolesManager() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { user } = useAuthUser();
  const { roles, catalog, loading, reload, capLevel, ownLevel } = useRolesData(
    user?.role
  );

  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<PlatformRole | null>(null);
  const [assigning, setAssigning] = useState<PlatformRole | null>(null);
  const [deleting, setDeleting] = useState<PlatformRole | null>(null);

  const canCreate = hasPermission(user, 'roles', 'write');

  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const sorted = sortRoles(roles);
    if (!needle) return sorted;
    return sorted.filter(
      (role) =>
        role.name.toLowerCase().includes(needle) ||
        getRoleMeta(role, t).label.toLowerCase().includes(needle)
    );
  }, [roles, query, t]);

  const customRoles = matched.filter((role) => !role.is_system);
  const systemRoles = matched.filter((role) => role.is_system);

  const summary = useMemo(() => {
    const system = roles.filter((r) => r.is_system).length;
    const assigned = roles.reduce((sum, r) => sum + r.user_count, 0);
    return [
      `${formatNumber(roles.length - system)} ${t('roles.statCustom')}`,
      `${formatNumber(system)} ${t('roles.statSystem')}`,
      `${formatNumber(assigned)} ${t('roles.statAssigned')}`
    ].join(' · ');
  }, [roles, formatNumber, t]);

  const viewingAbilities = viewing
    ? getRoleAbilities(viewing, user, capLevel, ownLevel)
    : null;

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiClient.deletePlatformRole(deleting.id);
      ErrorHandler.showSuccess(t('roles.roleDeleted'));
      setDeleting(null);
      await reload();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const renderCard = (role: PlatformRole) => (
    <RoleCard
      role={role}
      abilities={getRoleAbilities(role, user, capLevel, ownLevel)}
      isOwnRole={role.name === user?.role}
      onOpenPermissions={setViewing}
      onAssign={setAssigning}
      onDelete={setDeleting}
    />
  );

  return (
    <div className="space-y-5">
      <DataPanel
        title={t('roles.customSectionTitle')}
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
        filters={
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('roles.searchPlaceholder')}
              className="h-9 ltr:pl-9 rtl:pr-9"
            />
          </div>
        }
      >
        <DataList
          items={customRoles}
          rowKey={(role) => role.id}
          isLoading={loading}
          alwaysCards
          renderCard={renderCard}
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

      <DataPanel
        title={t('roles.systemSectionTitle')}
        subtitle={t('roles.systemSectionSubtitle')}
      >
        <DataList
          items={systemRoles}
          rowKey={(role) => role.id}
          isLoading={loading}
          alwaysCards
          renderCard={renderCard}
          emptyState={
            <div className="py-10">
              <EmptyState
                icon={<Shield className="h-8 w-8" />}
                title={t('roles.noMatchTitle')}
                description={t('roles.noMatchDesc')}
              />
            </div>
          }
        />
      </DataPanel>

      {creating && catalog && (
        <CreateRoleDialog
          open={creating}
          onClose={() => setCreating(false)}
          onCreated={reload}
          catalog={catalog}
          maxLevel={capLevel}
        />
      )}

      {viewing && catalog && viewingAbilities && (
        <RolePermissionsDialog
          role={viewing}
          catalog={catalog}
          open={!!viewing}
          onClose={() => setViewing(null)}
          onSaved={reload}
          readOnly={!viewingAbilities.canEdit}
          readOnlyReasonKey={viewingAbilities.readOnlyReasonKey}
        />
      )}

      {assigning && (
        <AssignRoleDialog
          role={assigning}
          open={!!assigning}
          onClose={() => setAssigning(null)}
          onAssigned={reload}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleting}
        title={t('roles.deleteTitle')}
        description={t('roles.deleteConfirm', {
          role: deleting ? getRoleMeta(deleting, t).label : ''
        })}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        confirmLabel={t('roles.deleteRole')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  );
}
