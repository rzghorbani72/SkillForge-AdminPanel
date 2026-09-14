'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import { Button } from '@/components/ui/button';
import { ClassHomeworkCard } from '@/components/class/class-homework-card';
import { ClassTimetableCard } from '@/components/class/class-timetable-card';
import { NextSessionCard } from '@/components/class/next-session-card';
import { useTranslation } from '@/lib/i18n/hooks';
import { ScheduleSessionCard } from '../../_components/schedule-session-card';
import { EngagementSummaryCard } from './_components/engagement-summary-card';
import { RequestedTimesCard } from './_components/requested-times-card';
import { SessionAttendanceCard } from './_components/session-attendance-card';
import { useEngagementClass } from './hooks/use-engagement-class';

const emptyScheduleForm = (engagementId: string) => ({
  engagement_id: engagementId,
  starts_at: '',
  ends_at: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  meeting_url: '',
  notes: '',
});

/**
 * One private (1:1) class, run the way a group class is: the same timetable
 * rows the student reads on the website, so what the teacher fills in here is
 * exactly what the student sees there.
 */
export default function EngagementClassPage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const params = useParams<{ engagement_id: string }>();
  const engagementId = params.engagement_id;
  const cls = useEngagementClass(engagementId);
  const [scheduleForm, setScheduleForm] = useState(() => emptyScheduleForm(engagementId));
  const [scheduledCount, setScheduledCount] = useState(0);

  const schedule = async () => {
    if (!scheduleForm.starts_at) return;
    await cls.schedule(scheduleForm);
    setScheduleForm(emptyScheduleForm(engagementId));
    setScheduledCount((n) => n + 1);
  };

  return (
    <LearningNavGate requiredCapability="tutoring">
      <main className="space-y-6 p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <Link
          href="/tutoring"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('tutoring.backToTutoring')}
        </Link>

        {cls.isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : !cls.engagement ? (
          <div className="space-y-3 rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">{t('tutoring.engagementNotFound')}</p>
            <Button asChild variant="outline">
              <Link href="/tutoring">{t('tutoring.backToTutoring')}</Link>
            </Button>
          </div>
        ) : (
          <>
            <EngagementSummaryCard engagement={cls.engagement} />
            <NextSessionCard sessions={cls.sessions} />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <ClassTimetableCard
                  sessions={cls.sessions}
                  topics={cls.topics}
                  isLoading={false}
                  onSessionChanged={cls.replaceSession}
                  onCancelSession={cls.cancelSession}
                />
                <ClassHomeworkCard sessions={cls.sessions} />
              </div>
              <div className="space-y-6">
                <RequestedTimesCard engagementId={engagementId} refreshKey={scheduledCount} />
                <ScheduleSessionCard
                  form={scheduleForm}
                  onChange={setScheduleForm}
                  activeEngagements={[cls.engagement]}
                  saving={cls.saving}
                  onSubmit={() => void schedule()}
                />
                <SessionAttendanceCard
                  sessions={cls.sessions}
                  saving={cls.saving}
                  onSubmit={(session, status) => void cls.markAttendance(session, status)}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </LearningNavGate>
  );
}
