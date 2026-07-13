'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useTutoringPage } from './hooks/use-tutoring-page';
import { useTutoringOffers } from './hooks/use-tutoring-offers';
import { TutoringEngagementsCard } from './_components/tutoring-engagements-card';
import { TutoringOffersCard } from './_components/tutoring-offers-card';
import { CreateOfferCard } from './_components/create-offer-card';
import { CreateEngagementCard } from './_components/create-engagement-card';
import { ScheduleSessionCard } from './_components/schedule-session-card';
import { RescheduleSessionCard } from './_components/reschedule-session-card';
import { MarkAttendanceCard } from './_components/mark-attendance-card';
import { LastSessionCard } from './_components/last-session-card';
import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import { OpsQueueFeatureGate } from '@/app/(protected)/learning/ops-queue/_components/ops-queue-feature-gate';
import { useTutorLedFeature } from '@/app/(protected)/learning/ops-queue/hooks/use-tutor-led-feature';

export default function TutoringPage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const tutoring = useTutoringPage();
  const offers = useTutoringOffers();
  const {
    featureEnabled,
    checkingFeature,
    enablingFeature,
    isManager,
    enableLearningFollowUp
  } = useTutorLedFeature();

  const showTutoring = !checkingFeature && featureEnabled !== false;

  return (
    <LearningNavGate requiredCapability="tutoring">
      <main
        className="space-y-6 p-4 sm:p-6"
        dir={isRtl ? 'rtl' : 'ltr'}
        aria-labelledby="tutoring-title"
      >
        <div>
          <h1 id="tutoring-title" className="text-3xl font-bold tracking-tight">
            {t('tutoring.title')}
          </h1>
          <p className="text-muted-foreground">{t('tutoring.description')}</p>
        </div>

        {!showTutoring ? (
          <OpsQueueFeatureGate
            checkingFeature={checkingFeature}
            featureEnabled={featureEnabled}
            isManager={isManager}
            enablingFeature={enablingFeature}
            onEnable={enableLearningFollowUp}
          />
        ) : (
          <>
            <TutoringOffersCard
              offers={offers.offers}
              loading={offers.loading}
              saving={offers.saving}
              onToggleActive={(offer) => void offers.toggleActive(offer)}
            />

            <TutoringEngagementsCard
              engagements={tutoring.engagements}
              loading={tutoring.loading}
              courseFilter={tutoring.courseFilter}
              onCourseFilterChange={tutoring.setCourseFilter}
              onRefresh={tutoring.loadData}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <CreateOfferCard
                form={offers.form}
                onChange={offers.setForm}
                saving={offers.saving}
                onSubmit={offers.createOffer}
              />

              <CreateEngagementCard
                form={tutoring.engagementForm}
                onChange={tutoring.setEngagementForm}
                saving={tutoring.saving}
                onSubmit={tutoring.createEngagement}
              />

              <ScheduleSessionCard
                form={tutoring.sessionForm}
                onChange={tutoring.setSessionForm}
                activeEngagements={tutoring.activeEngagements}
                saving={tutoring.saving}
                onSubmit={tutoring.scheduleSession}
              />

              <RescheduleSessionCard
                form={tutoring.rescheduleForm}
                onChange={tutoring.setRescheduleForm}
                saving={tutoring.saving}
                onReschedule={tutoring.rescheduleSession}
                onCancel={(sessionId) => void tutoring.cancelSession(sessionId)}
              />

              <MarkAttendanceCard
                form={tutoring.attendanceForm}
                onSessionIdChange={(sessionId) =>
                  void tutoring.setAttendanceSessionId(sessionId)
                }
                onProfileIdChange={(profileId) =>
                  tutoring.setAttendanceForm((prev) => ({
                    ...prev,
                    profile_id: profileId
                  }))
                }
                onStatusChange={(status) =>
                  tutoring.setAttendanceForm((prev) => ({ ...prev, status }))
                }
                saving={tutoring.saving}
                onSubmit={tutoring.markAttendance}
              />
            </div>

            {tutoring.lastSession ? (
              <LastSessionCard session={tutoring.lastSession} />
            ) : null}
          </>
        )}
      </main>
    </LearningNavGate>
  );
}
