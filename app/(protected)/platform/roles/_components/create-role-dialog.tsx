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

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  /** Ceiling for the level input — the actor's own rank cap (see roles-manager.tsx). */
  maxLevel?: number;
}

const NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;

export function CreateRoleDialog({
  open,
  onClose,
  onCreated,
  maxLevel = 5
}: Props) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState(0);

  const nameValid = NAME_PATTERN.test(name);
  const levelOptions = selectableAccessLevels(maxLevel);
  const levelValid = levelOptions.some((option) => option.level === level);

  const submit = async () => {
    if (!nameValid || !levelValid) return;
    try {
      setSaving(true);
      await apiClient.createPlatformRole({
        name,
        label: label || undefined,
        description: description || undefined,
        hierarchy_level: level
      });
      ErrorHandler.showSuccess(t('roles.roleCreated'));
      onCreated();
      onClose();
      setName('');
      setLabel('');
      setDescription('');
      setLevel(0);
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
          <DialogTitle>{t('roles.createTitle')}</DialogTitle>
          <DialogDescription>{t('roles.createHint')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role-name">{t('roles.nameLabel')}</Label>
            <Input
              id="role-name"
              value={name}
              placeholder="CONTENT_MODERATOR"
              onChange={(e) => setName(e.target.value.toUpperCase())}
            />
            {name && !nameValid && (
              <p className="text-xs text-destructive">
                {t('roles.nameInvalid')}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-label">{t('roles.labelLabel')}</Label>
            <Input
              id="role-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-desc">{t('roles.descriptionLabel')}</Label>
            <Textarea
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-level">{t('roles.levelLabel')}</Label>
            <Select
              value={String(level)}
              onValueChange={(value) => setLevel(Number(value))}
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
            <p className="text-xs text-muted-foreground">
              {t('roles.levelHint')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={submit}
            disabled={saving || !nameValid || !levelValid}
          >
            {saving ? t('common.saving') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
