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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getAccessLevelLabel, selectableAccessLevels } from './access-levels';
import { defaultsFor } from './level-defaults';
import { PermissionGrid } from './permission-grid';
import { usePermissionSelection } from './use-permission-selection';
import type { PermissionCatalog } from '@/types/roles';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  catalog: PermissionCatalog;
  /** Ceiling for the level input — the actor's own rank cap (see roles-manager.tsx). */
  maxLevel: number;
}

export function CreateRoleDialog({
  open,
  onClose,
  onCreated,
  catalog,
  maxLevel
}: Props) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState(0);
  const { granted, toggle, toggleResource, replace, permissions } =
    usePermissionSelection(defaultsFor(catalog, 0));

  const labelValid = label.trim().length >= 2;
  const levelOptions = selectableAccessLevels(maxLevel);
  const levelValid = levelOptions.some((option) => option.level === level);

  // Picking an access level loads that level's usual permissions, so the role
  // arrives useful instead of empty. Everything stays editable before saving.
  const changeLevel = (next: number) => {
    setLevel(next);
    replace(defaultsFor(catalog, next));
  };

  const reset = () => {
    setLabel('');
    setDescription('');
    setLevel(0);
    replace(defaultsFor(catalog, 0));
  };

  const submit = async () => {
    if (!labelValid || !levelValid) return;
    try {
      setSaving(true);
      await apiClient.createPlatformRole({
        label: label.trim(),
        description: description || undefined,
        hierarchy_level: level,
        permissions
      });
      ErrorHandler.showSuccess(t('roles.roleCreated'));
      onCreated();
      onClose();
      reset();
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
          <DialogTitle>{t('roles.createTitle')}</DialogTitle>
          <DialogDescription>{t('roles.createHint')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* The three settings share one row so the permission matrix — the
              part that actually needs room — gets the rest of the panel. */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="role-label">{t('roles.labelLabel')}</Label>
              <Input
                id="role-label"
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
              <Label htmlFor="role-level">{t('roles.levelLabel')}</Label>
              <Select
                value={String(level)}
                onValueChange={(value) => changeLevel(Number(value))}
              >
                <SelectTrigger id="role-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((option) => (
                    <SelectItem key={option.level} value={String(option.level)}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!levelValid && (
                <p className="text-xs text-destructive">
                  {t('roles.levelCapHint', {
                    level: getAccessLevelLabel(maxLevel, t)
                  })}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role-desc">{t('roles.descriptionLabel')}</Label>
              <Textarea
                id="role-desc"
                className="min-h-[38px]"
                rows={1}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('roles.permissionsLabel')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('roles.levelHint')} {t('roles.defaultsHint')}
            </p>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={submit}
            disabled={saving || !labelValid || !levelValid}
          >
            {saving ? t('common.saving') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
