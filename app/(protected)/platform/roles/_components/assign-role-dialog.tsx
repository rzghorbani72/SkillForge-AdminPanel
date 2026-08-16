'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EntitySearchCombobox } from '@/components/entity-search';
import { createAcademyUserOptionsFetcher } from '@/components/entity-search/entity-search-utils';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getRoleMeta } from './role-meta';
import type { PlatformRole } from '@/types/roles';

interface Props {
  role: PlatformRole;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

/** Manager rank: handing out a role at this level or above uses a plan seat. */
const MANAGER_LEVEL = 3;

export function AssignRoleDialog({ role, open, onClose, onAssigned }: Props) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const [profileId, setProfileId] = useState('');
  const [saving, setSaving] = useState(false);

  const usesSeat = role.hierarchy_level >= MANAGER_LEVEL;
  const fetchUsers = useMemo(
    () => createAcademyUserOptionsFetcher(t, user?.id),
    [t, user?.id]
  );

  const submit = async () => {
    if (!profileId) return;
    try {
      setSaving(true);
      const result = await apiClient.assignPlatformRole(role.id, profileId);
      ErrorHandler.showSuccess(
        t(result.changed ? 'roles.roleAssigned' : 'roles.roleAlreadyAssigned')
      );
      onAssigned();
      onClose();
      setProfileId('');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('roles.assignTitle', { role: getRoleMeta(role, t).label })}
          </DialogTitle>
          <DialogDescription>{t('roles.assignHint')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="assign-user">{t('roles.assignUserLabel')}</Label>
          <EntitySearchCombobox
            id="assign-user"
            value={profileId}
            onValueChange={setProfileId}
            fetchOptions={fetchUsers}
            placeholder={t('roles.assignUserPlaceholder')}
            clearable
          />

          {usesSeat && (
            <p className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t('roles.assignSeatWarning')}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={saving || !profileId}>
            {saving ? t('common.saving') : t('roles.assignAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
