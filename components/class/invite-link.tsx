'use client';

import { Check, Link2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { academySiteUrl } from '@/lib/academy-site-url';
import { useTranslation } from '@/lib/i18n/hooks';

/** The link a student sends friends to fill a class; every class has one. */
export function InviteLink({ joinCode }: { joinCode: string }) {
  const { t } = useTranslation();
  const academy = useCurrentAcademy();
  const [copied, setCopied] = useState(false);
  const base = academySiteUrl(academy) ?? '';
  const url = `${base}/classes/join/${joinCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; the address is still visible to select.
    }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">
        {t('tutoring.groups.inviteLink')}
      </p>
      <div className="flex items-center gap-2">
        <code
          dir="ltr"
          className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-xs"
        >
          {url}
        </code>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void copy()}
        >
          {copied ? (
            <Check className="me-1.5 h-3.5 w-3.5" />
          ) : (
            <Link2 className="me-1.5 h-3.5 w-3.5" />
          )}
          {copied ? t('common.copied') : t('common.copy')}
        </Button>
      </div>
    </div>
  );
}
