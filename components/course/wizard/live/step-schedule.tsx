'use client';

import Link from 'next/link';

import { Note } from '@/components/shared/note';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { DeadlineSection } from './deadline-section';
import { SessionsCard } from './sessions-card';
import type { LiveClassDraftApi } from './use-live-class-draft';
import { WeeklyScheduleCard } from './weekly-schedule-card';

export function StepSchedule({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const classesPage = `/courses/${live.courseId}/live`;

  return (
    <div className="flex flex-col gap-4">
      {live.scheduleLocked ? (
        <Note tone="warn">
          {t('liveWizard.scheduleLocked')}{' '}
          <Link href={classesPage} className="font-bold underline">
            {t('liveWizard.openClassesPage')}
          </Link>
        </Note>
      ) : null}
      {live.otherClasses > 0 ? (
        <Note>
          {t('liveWizard.otherClasses', { count: formatNumber(live.otherClasses) })}{' '}
          <Link href={classesPage} className="font-bold underline">
            {t('liveWizard.openClassesPage')}
          </Link>
        </Note>
      ) : null}

      <WeeklyScheduleCard live={live} />
      <SessionsCard live={live} />

      <DeadlineSection live={live} />
    </div>
  );
}
