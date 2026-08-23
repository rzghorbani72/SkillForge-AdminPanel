'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import { OpsQueueFeatureGate } from '@/app/(protected)/learning/ops-queue/_components/ops-queue-feature-gate';
import { useTutorLedFeature } from '@/app/(protected)/learning/ops-queue/hooks/use-tutor-led-feature';
import { useTutoringOffers } from '../hooks/use-tutoring-offers';
import { useTutoringGroups } from './hooks/use-tutoring-groups';
import { GroupsListCard } from './_components/groups-list-card';
import { CreateGroupCard } from './_components/create-group-card';

export default function TutoringGroupsPage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const offers = useTutoringOffers();
  const groups = useTutoringGroups();
  const {
    featureEnabled,
    checkingFeature,
    enablingFeature,
    isManager,
    enableLearningFollowUp
  } = useTutorLedFeature();

  const showGroups = !checkingFeature && featureEnabled !== false;
  const waiting = groups.groups.filter((group) => group.status === 'WAITING');

  return (
    <LearningNavGate requiredCapability="tutoring">
      <main
        className="space-y-6 p-4 sm:p-6"
        dir={isRtl ? 'rtl' : 'ltr'}
        aria-labelledby="tutoring-groups-title"
      >
        <div>
          <h1
            id="tutoring-groups-title"
            className="text-3xl font-bold tracking-tight"
          >
            {t('tutoring.groups.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('tutoring.groups.description')}
          </p>
        </div>

        {!showGroups ? (
          <OpsQueueFeatureGate
            checkingFeature={checkingFeature}
            featureEnabled={featureEnabled}
            isManager={isManager}
            enablingFeature={enablingFeature}
            onEnable={enableLearningFollowUp}
          />
        ) : (
          <>
            {waiting.length > 0 ? (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                {t('tutoring.groups.waitingBanner')}
              </p>
            ) : null}
            <GroupsListCard
              groups={groups.groups}
              loading={groups.loading}
              saving={groups.saving}
              onPublish={groups.publish}
            />
            <CreateGroupCard
              offers={offers.offers}
              form={groups.form}
              saving={groups.saving}
              onChange={groups.setForm}
              onSubmit={() => void groups.create()}
            />
          </>
        )}
      </main>
    </LearningNavGate>
  );
}
