'use client';

import { useEffect, useState } from 'react';
import { Plus, Shield, Trash2, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { PermissionCatalog, PlatformRole } from '@/types/roles';
import { RolePermissionsDialog } from './role-permissions-dialog';

export function RolesManager() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PlatformRole | null>(null);
  const [deleting, setDeleting] = useState<PlatformRole | null>(null);

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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-end gap-1">
        <Button disabled title={t('roles.createDisabledHint')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('roles.addRole')}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t('roles.createDisabledHint')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-4 w-4 text-primary" />
                  {role.label}
                </CardTitle>
                {role.is_system ? (
                  <Badge variant="secondary">{t('roles.systemBadge')}</Badge>
                ) : (
                  <Badge variant="outline">{t('roles.customBadge')}</Badge>
                )}
              </div>
              <CardDescription>{role.description || role.name}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {t('roles.userCount', { count: role.user_count })}
                </span>
                <span>
                  {t('roles.permissionCount', {
                    count: role.permissions.length
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditing(role)}
                >
                  {t('roles.editPermissions')}
                </Button>
                {!role.is_system && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(role)}
                    aria-label={t('roles.deleteRole')}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
        description={t('roles.deleteConfirm', { role: deleting?.label ?? '' })}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        confirmLabel={t('roles.deleteRole')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  );
}
