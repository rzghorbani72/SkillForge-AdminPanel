'use client';

import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SaveStatus } from './useCourseForm';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  onRetry: () => void;
}

/**
 * Autosave has no button to click, so this is the only proof the work is safe.
 * It stays quiet until there is something to say.
 */
export function SaveStatusIndicator({
  status,
  onRetry
}: SaveStatusIndicatorProps) {
  const { t } = useTranslation();

  if (status === 'idle') return null;

  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>{t('courses.saveFailed')}</span>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-sm"
          onClick={onRetry}
        >
          {t('courses.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {status === 'saving' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('courses.saving')}</span>
        </>
      ) : (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span>{t('courses.saved')}</span>
        </>
      )}
    </div>
  );
}
