'use client';

import { Globe, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { LiveClassDraftApi } from './use-live-class-draft';
import type { LivePublishApi } from './use-live-publish';

type PublishProps = {
  live: LiveClassDraftApi;
  publisher: LivePublishApi;
  isPublished: boolean;
};

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
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {t('liveWizard.saveDraft')}
        </Button>
      )}
      <Button
        type="button"
        disabled={publisher.isBusy || !live.isComplete}
        onClick={() => void publisher.publish()}
        className="gap-2"
      >
        <Globe className="h-4 w-4" />
        {t(isPublished ? 'liveWizard.saveChanges' : 'liveWizard.publish')}
      </Button>
    </>
  );
}
