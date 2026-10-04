'use client';

import type { ReactNode } from 'react';

import type { CourseWizardStep } from '../wizard-steps';
import { PublishActions } from './publish-actions';
import type { LiveClassDraftApi } from './use-live-class-draft';
import type { LivePublishApi } from './use-live-publish';

type LiveStepLayoutProps = {
  step: CourseWizardStep;
  live: LiveClassDraftApi;
  publisher: LivePublishApi;
  isPublished: boolean;
  children: ReactNode;
};

/** On review, the publish choice sits beside the step; other steps use the full width. */
export function LiveStepLayout({
  step,
  live,
  publisher,
  isPublished,
  children,
}: LiveStepLayoutProps) {
  if (step !== 'review' || publisher.justPublished || live.isLoading) return <>{children}</>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <div className="min-w-0">{children}</div>
      <aside className="lg:sticky lg:top-32">
        <PublishActions live={live} publisher={publisher} isPublished={isPublished} />
      </aside>
    </div>
  );
}
