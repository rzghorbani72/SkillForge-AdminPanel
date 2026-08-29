'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { User, UserResetMode } from '@/types/api';

const MODES: readonly UserResetMode[] = [
  'CREDENTIALS',
  'LEARNING_RECORD',
  'ERASE'
];

const MODE_KEY: Record<UserResetMode, string> = {
  CREDENTIALS: 'Credentials',
  LEARNING_RECORD: 'LearningRecord',
  ERASE: 'Erase'
};

export function ResetUserDialog({
  open,
  onOpenChange,
  target,
  onDone
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: User | null;
  onDone?: () => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<UserResetMode>('CREDENTIALS');
  const [confirmIdentifier, setConfirmIdentifier] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('CREDENTIALS');
      setConfirmIdentifier('');
    }
  }, [open]);

  const destructive = mode !== 'CREDENTIALS';

  const submit = async () => {
    const userId = target?.user_id;
    if (!userId) return;
    if (destructive && confirmIdentifier.trim().length === 0) {
      ErrorHandler.showError(t('accountActions.confirmIdentifierMismatch'));
      return;
    }
    setSaving(true);
    try {
      await apiClient.resetPlatformUser(userId, {
        mode,
        ...(destructive ? { confirm_identifier: confirmIdentifier.trim() } : {})
      });
      ErrorHandler.showSuccess(t('accountActions.reset_ok'));
      onOpenChange(false);
      onDone?.();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('accountActions.resetTitle')}</DialogTitle>
          <DialogDescription>
            {t('accountActions.resetDescription')}
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">
          {target?.display_name || target?.full_name || '—'}
        </p>

        <RadioGroup
          value={mode}
          onValueChange={(value) => setMode(value as UserResetMode)}
          className="gap-3"
        >
          {MODES.map((value) => (
            <label
              key={value}
              htmlFor={`reset-${value}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary"
            >
              <RadioGroupItem
                id={`reset-${value}`}
                value={value}
                className="mt-1"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">
                  {t(`accountActions.mode${MODE_KEY[value]}`)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t(`accountActions.mode${MODE_KEY[value]}Help`)}
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>

        {destructive && (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {t('accountActions.irreversible')}
            </p>
            <Label htmlFor="reset-confirm">
              {t('accountActions.confirmIdentifierLabel')}
            </Label>
            <Input
              id="reset-confirm"
              dir="ltr"
              value={confirmIdentifier}
              onChange={(event) => setConfirmIdentifier(event.target.value)}
              placeholder={target?.phone_number || target?.email || ''}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => void submit()}
            disabled={saving}
          >
            {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t('accountActions.reset')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
