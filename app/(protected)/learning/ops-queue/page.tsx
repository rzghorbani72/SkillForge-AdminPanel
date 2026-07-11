'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useTutorLedFeature } from './hooks/use-tutor-led-feature';
import { useOpsQueue } from './hooks/use-ops-queue';
import { OpsQueueFeatureGate } from './_components/ops-queue-feature-gate';
import { OpsQueueFiltersCard } from './_components/ops-queue-filters-card';
import { OpsQueueInterventionForm } from './_components/ops-queue-intervention-form';
import { OpsQueueResults } from './_components/ops-queue-results';
import { LearningNavGate } from '@/components/access-control/learning-nav-gate';

export default function OpsQueuePage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const {
    featureEnabled,
    checkingFeature,
    enablingFeature,
    isManager,
    enableLearningFollowUp
  } = useTutorLedFeature();
  const opsQueue = useOpsQueue(featureEnabled);

  const showQueue = !checkingFeature && featureEnabled !== false;

  return (
    <LearningNavGate requiredCapability="ops_queue">
      <main
        className="space-y-6 p-4 sm:p-6"
        dir={isRtl ? 'rtl' : 'ltr'}
        aria-labelledby="ops-queue-title"
      >
        <div>
          <h1
            id="ops-queue-title"
            className="text-3xl font-bold tracking-tight"
          >
            {t('opsQueue.title')}
          </h1>
          <p className="text-muted-foreground">{t('opsQueue.description')}</p>
        </div>

        {!showQueue ? (
          <OpsQueueFeatureGate
            checkingFeature={checkingFeature}
            featureEnabled={featureEnabled}
            isManager={isManager}
            enablingFeature={enablingFeature}
            onEnable={enableLearningFollowUp}
          />
        ) : (
          <>
            <OpsQueueFiltersCard
              courseId={opsQueue.courseId}
              onCourseIdChange={opsQueue.setCourseId}
              inactiveDays={opsQueue.inactiveDays}
              onInactiveDaysChange={opsQueue.setInactiveDays}
              lowScoreThreshold={opsQueue.lowScoreThreshold}
              onLowScoreThresholdChange={opsQueue.setLowScoreThreshold}
              onRefresh={opsQueue.loadQueue}
            />

            <OpsQueueInterventionForm
              noteProfileId={opsQueue.noteProfileId}
              onNoteProfileIdChange={opsQueue.setNoteProfileId}
              followUpAt={opsQueue.followUpAt}
              onFollowUpAtChange={opsQueue.setFollowUpAt}
              noteText={opsQueue.noteText}
              onNoteTextChange={opsQueue.setNoteText}
              savingNote={opsQueue.savingNote}
              onSave={opsQueue.saveInterventionNote}
            />

            <OpsQueueResults
              queue={opsQueue.queue}
              loading={opsQueue.loading}
              onUseForNote={opsQueue.setNoteProfileId}
            />
          </>
        )}
      </main>
    </LearningNavGate>
  );
}
