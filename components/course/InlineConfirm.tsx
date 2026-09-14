'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

interface InlineConfirmProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Destructive confirm that stays in place instead of opening a dialog. */
export function InlineConfirm({ message, onCancel, onConfirm }: InlineConfirmProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 border-t bg-destructive/5 px-4 py-2.5">
      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
      <span className="flex-1 text-sm text-destructive">{message}</span>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 px-3 text-xs"
        onClick={onCancel}
      >
        {t('common.cancel')}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        className="h-7 px-3 text-xs"
        onClick={onConfirm}
      >
        {t('common.delete')}
      </Button>
    </div>
  );
}
