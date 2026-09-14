'use client';

import { Info, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AssignAccessSubmitProps = {
  label: string;
  /** Why the button is off; when set, the button stays disabled. */
  blockedHint?: string;
  /** Shown instead of the hint once a target is chosen. */
  readyHint?: string;
  isSaving: boolean;
  onSubmit: () => void;
};

/**
 * Submit row for the give-access form: always says why the button is off, so an
 * inactive button never looks broken.
 */
export function AssignAccessSubmit({
  label,
  blockedHint,
  readyHint,
  isSaving,
  onSubmit,
}: AssignAccessSubmitProps) {
  return (
    <div className="space-y-2">
      {blockedHint ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          {blockedHint}
        </p>
      ) : readyHint ? (
        <p className="text-xs text-muted-foreground">{readyHint}</p>
      ) : null}

      <Button type="button" onClick={onSubmit} disabled={Boolean(blockedHint) || isSaving}>
        {isSaving ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="me-2 h-4 w-4" />
        )}
        {label}
      </Button>
    </div>
  );
}
