'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SaveStatus } from '../useCourseForm';

const SUCCESS_FLASH_MS = 1000;

interface WizardSaveButtonProps {
  saveStatus: SaveStatus;
  onSave: () => Promise<boolean>;
  onRetry: () => void;
}

/**
 * One slot in the steps header for everything about saving: the button that
 * triggers it and the outcome of the last save, autosave included. Only one
 * of the two is ever visible — the button hides while a message is shown, and
 * reappears once it clears, rather than sitting next to it.
 *
 * `saveStatus` comes from autosave and never reverts to idle on its own once a
 * save has happened, so the "ذخیره شد" flash is timed locally: it starts on
 * every fresh transition into `saved` and expires after `SUCCESS_FLASH_MS`,
 * after which this control falls back to the button regardless of what the
 * still-`saved` prop says.
 *
 * The flash has two triggers, not one. A background autosave is caught as a
 * transition into `saved` below. But clicking Save when nothing has changed
 * since the last save is not a transition at all — `saveStatus` was already
 * `saved` and stays `saved` — so the click handler flashes directly off its
 * own resolved result, which is the only way that click gets any feedback.
 */
export function WizardSaveButton({
  saveStatus,
  onSave,
  onRetry
}: WizardSaveButtonProps) {
  const { t } = useTranslation();
  const [prevStatus, setPrevStatus] = useState(saveStatus);
  const [showSavedFlash, setShowSavedFlash] = useState(false);

  // Derived-state-during-render, not an effect: reacting to `saveStatus`
  // changing is a plain render-time adjustment, not a subscription or timer.
  // https://react.dev/learn/you-might-not-need-an-effect
  if (saveStatus !== prevStatus) {
    setPrevStatus(saveStatus);
    if (saveStatus === 'saved') setShowSavedFlash(true);
  }

  // The timer itself is a legitimate effect: it is the thing that eventually
  // ends the flash on its own, with no further input.
  useEffect(() => {
    if (!showSavedFlash) return;
    const timer = setTimeout(() => setShowSavedFlash(false), SUCCESS_FLASH_MS);
    return () => clearTimeout(timer);
  }, [showSavedFlash]);

  async function handleClick() {
    const ok = await onSave();
    if (ok) setShowSavedFlash(true);
  }

  if (saveStatus === 'saving') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t('courses.saving')}</span>
      </div>
    );
  }

  if (saveStatus === 'error') {
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

  if (saveStatus === 'saved' && showSavedFlash) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-600" />
        <span>{t('courses.saved')}</span>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleClick()}
      className="gap-1.5"
    >
      <Save className="h-4 w-4" />
      {t('common.save')}
    </Button>
  );
}
