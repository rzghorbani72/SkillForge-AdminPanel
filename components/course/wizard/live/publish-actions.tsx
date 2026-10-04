'use client';

import type { ReactNode } from 'react';
import { FileText, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { LiveClassDraftApi } from './use-live-class-draft';
import type { LivePublishApi } from './use-live-publish';

function ActionCard({
  primary,
  icon: Icon,
  title,
  hint,
  children,
}: {
  primary?: boolean;
  icon: typeof Globe;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'space-y-2 rounded-xl border p-4',
        primary ? 'border-primary bg-primary/5' : 'bg-card',
      )}
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        {title}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      {children}
    </div>
  );
}

/** Publish vs. save as draft, side by side, so the difference is read before the click. */
export function PublishActions({
  live,
  publisher,
  isPublished,
}: {
  live: LiveClassDraftApi;
  publisher: LivePublishApi;
  isPublished: boolean;
}) {
  const { t } = useTranslation();

  return (
    <section className="space-y-3 rounded-2xl border bg-muted/30 p-4">
      <h2 className="text-sm font-bold">{t('liveWizard.reviewReady')}</h2>
      <ActionCard
        primary
        icon={Globe}
        title={t(isPublished ? 'liveWizard.saveChanges' : 'liveWizard.publish')}
        hint={t(isPublished ? 'liveWizard.saveChangesExplain' : 'liveWizard.publishExplain')}
      >
        <Button
          type="button"
          className="w-full"
          disabled={publisher.isBusy || !live.isComplete}
          onClick={() => void publisher.publish()}
        >
          {t(isPublished ? 'liveWizard.saveChanges' : 'liveWizard.publish')}
        </Button>
      </ActionCard>
      {isPublished ? null : (
        <ActionCard
          icon={FileText}
          title={t('liveWizard.saveDraft')}
          hint={t('liveWizard.draftExplain')}
        >
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={publisher.isBusy}
            onClick={() => void publisher.saveDraft()}
          >
            {t('liveWizard.saveDraft')}
          </Button>
        </ActionCard>
      )}
    </section>
  );
}
