'use client';

import { Copy } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/hooks/useStore';
import { academySiteUrl } from '@/lib/academy-site-url';
import { useTranslation } from '@/lib/i18n/hooks';
import type { LiveClassDraftApi } from './use-live-class-draft';

/**
 * The link students use to enter. An academy room is the class page on the
 * academy site — never the raw meeting room — so only enrolled students get in.
 */
export function useClassLink(live: LiveClassDraftApi): string | null {
  const { selectedAcademy } = useStore();
  if (live.draft.meeting === 'OWN') return live.draft.meetingUrl.trim() || null;
  const site = academySiteUrl(selectedAcademy);
  const slug = live.course?.slug;
  return site && slug ? `${site}/learn/${encodeURIComponent(slug)}/live` : null;
}

export function ClassLinkField({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const link = useClassLink(live);

  if (!link)
    return <p className="text-sm text-muted-foreground">{t('liveWizard.classLinkPending')}</p>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t('liveWizard.classLinkCopied'));
    } catch {
      toast.info(link);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input readOnly dir="ltr" value={link} onFocus={(event) => event.target.select()} />
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-2"
          onClick={() => void copy()}
        >
          <Copy className="h-4 w-4" aria-hidden />
          {t('common.copy')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t(
          live.draft.meeting === 'OWN'
            ? 'liveWizard.classLinkOwnHint'
            : 'liveWizard.classLinkAutoHint',
        )}
      </p>
    </div>
  );
}
