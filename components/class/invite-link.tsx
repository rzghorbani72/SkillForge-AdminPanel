'use client';

import { Check, Link2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { resolveAcademySiteUrls } from '@/lib/academy-site-url';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * Share link so friends can book the same class. Prefer the Mentoma subdomain
 * over a custom domain — custom hostnames are often saved before DNS works,
 * and a dead invite link blocks enrollment.
 */
export function InviteLink({
  joinCode,
  coursePublished = true,
}: {
  joinCode: string;
  /** Storefront join works only when the parent course is published. */
  coursePublished?: boolean;
}) {
  const { t } = useTranslation();
  const academy = useCurrentAcademy();
  const [copied, setCopied] = useState(false);
  const urls = resolveAcademySiteUrls(academy);
  const base = (urls.subdomain ?? urls.public ?? '').replace(/\/$/, '');
  const url = base ? `${base}/classes/join/${joinCode}` : '';

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; the address is still visible to select.
    }
  };

  if (!url) return null;

  if (!coursePublished) {
    return (
      <p className="text-xs text-muted-foreground">{t('tutoring.groups.inviteLinkCourseDraft')}</p>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{t('tutoring.groups.inviteLink')}</p>
      <div className="flex items-center gap-2">
        <code dir="ltr" className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-xs">
          {url}
        </code>
        <Button type="button" size="sm" variant="outline" onClick={() => void copy()}>
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
