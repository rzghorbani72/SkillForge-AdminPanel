'use client';

import type { ReactNode } from 'react';

import type { CourseWizardStep } from '../wizard-steps';
import { LiveGlance } from './live-glance';
import { PublishActions } from './publish-actions';
import type { LiveClassDraftApi } from './use-live-class-draft';
import type { LivePublishApi } from './use-live-publish';

type LiveStepLayoutProps = {
  step: CourseWizardStep;
  live: LiveClassDraftApi;
  publisher: LivePublishApi;
  title: string;
  isPublished: boolean;
  children: ReactNode;
};

/** Steps on the left, the class summary (or, on review, the publish choice) beside them. */
export function LiveStepLayout({
  step,
  live,
  publisher,
  title,
  isPublished,
  children,
}: LiveStepLayoutProps) {
  if ((publisher.justPublished && step === 'review') || live.isLoading) return <>{children}</>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <div className="min-w-0">{children}</div>
      <aside className="lg:sticky lg:top-32">
        {step === 'review' ? (
          <PublishActions live={live} publisher={publisher} isPublished={isPublished} />
        ) : (
          <LiveGlance live={live} title={title} step={step} />
        )}
      </aside>
    </div>
  );
}
