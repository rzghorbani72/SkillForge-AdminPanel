'use client';

import type { ReactNode } from 'react';
import { FileText, Globe, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IconBox } from '@/components/shared/icon-box';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { LiveClassDraftApi } from './use-live-class-draft';
import type { LivePublishApi } from './use-live-publish';

type PublishProps = {
  live: LiveClassDraftApi;
  publisher: LivePublishApi;
  isPublished: boolean;
};

function ActionCard({
  primary,
  icon,
  title,
  hint,
  children,
}: {
  primary?: boolean;
  icon: LucideIcon;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-xl border-[1.5px] p-4',
        primary ? 'border-primary bg-primary/10' : 'border-border bg-card',
      )}
    >
      <p className="flex items-center gap-3">
        <IconBox icon={icon} tone={primary ? 'primary' : 'muted'} />
        <span className="text-[15px] font-extrabold">{title}</span>
      </p>
      <p className="text-[13px] text-muted-foreground">{hint}</p>
      {children}
    </div>
  );
}

/** Publish vs. save as draft, side by side, so the difference is read before the click. */
export function PublishActions({ live, publisher, isPublished }: PublishProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card px-[18px] py-4">
      <h2 className="text-[15px] font-extrabold">{t('liveWizard.reviewReady')}</h2>
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

/** The same two actions in the page footer, so they are reachable without scrolling up. */
export function PublishFooterActions({ live, publisher, isPublished }: PublishProps) {
  const { t } = useTranslation();

  return (
    <>
      {isPublished ? null : (
        <Button
          type="button"
          variant="outline"
          disabled={publisher.isBusy}
          onClick={() => void publisher.saveDraft()}
        >
          {t('liveWizard.saveDraft')}
        </Button>
      )}
      <Button
        type="button"
        disabled={publisher.isBusy || !live.isComplete}
        onClick={() => void publisher.publish()}
      >
        {t(isPublished ? 'liveWizard.saveChanges' : 'liveWizard.publish')}
      </Button>
    </>
  );
}
