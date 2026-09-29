'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { createAcademyUserOptionsFetcher } from '@/components/entity-search/entity-search-utils';
import type { EntitySearchOption } from '@/types/entity-search';
import { getRoleMeta } from './role-meta';
import type { PlatformRole } from '@/types/roles';

interface Props {
  role: PlatformRole;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

const MANAGER_LEVEL = 3;

export function AssignRoleDialog({ role, open, onClose, onAssigned }: Props) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const [search, setSearch] = useState('');
  const query = useDebounce(search, 300);
  const [options, setOptions] = useState<EntitySearchOption[]>([]);
  const [selected, setSelected] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);

  const usesSeat = role.hierarchy_level >= MANAGER_LEVEL;

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const fetchUsers = createAcademyUserOptionsFetcher(t, user?.id);
        setOptions(await fetchUsers(query, controller.signal));
      } catch (error) {
        if (!controller.signal.aborted) ErrorHandler.handleApiError(error);
      }
    };
    void load();
    return () => controller.abort();
  }, [query, t, user?.id]);

  const toggle = useCallback((option: EntitySearchOption) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(option.value)) next.delete(option.value);
      else next.set(option.value, option.label);
      return next;
    });
  }, []);

  const submit = async () => {
    if (selected.size === 0) return;
    try {
      setSaving(true);
      const { results } = await apiClient.assignPlatformRoleToMany(
        role.id,
        Array.from(selected.keys()),
      );
      const failed = results.filter((r) => r.status === 'failed');
      if (failed.length === 0) {
        ErrorHandler.showSuccess(t('roles.roleAssigned'));
        onAssigned();
        onClose();
        setSelected(new Map());
        return;
      }
      ErrorHandler.showError(
        t('roles.assignSummary', { done: results.length - failed.length, failed: failed.length }),
      );
      setSelected(new Map(failed.map((r) => [r.profile_id, selected.get(r.profile_id) ?? ''])));
      onAssigned();
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
          <DialogTitle>{t('roles.assignTitle', { role: getRoleMeta(role, t).label })}</DialogTitle>
          <DialogDescription>
            {t('roles.assignHint')} {t('roles.assignChangeHint')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('roles.assignSearchPlaceholder')}
              className="ps-9"
            />
          </div>

          <ul className="h-64 divide-y overflow-y-auto rounded-md border">
            {options.length === 0 && (
              <li className="p-4 text-center text-sm text-muted-foreground">
                {t('roles.assignNoResults')}
              </li>
            )}
            {options.map((option) => (
              <li key={option.value}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/50">
                  <Checkbox
                    checked={selected.has(option.value)}
                    onCheckedChange={() => toggle(option)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{option.label}</span>
                    {option.description && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>

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
          <Button onClick={submit} disabled={saving || selected.size === 0}>
            {saving
              ? t('common.saving')
              : selected.size > 0
                ? t('roles.assignActionMany', { count: selected.size })
                : t('roles.assignAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
