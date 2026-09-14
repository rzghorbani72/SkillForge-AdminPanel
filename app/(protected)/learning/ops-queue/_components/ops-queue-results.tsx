'use client';

import { AlertTriangle, Clock3, GraduationCap, MessageCircle, UserX } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OpsQueueResponse } from '@/types/learning-operations';
import { QueueCard } from './queue-card';
import { OverdueGradingItem } from './items/overdue-grading-item';
import { InactivityItem } from './items/inactivity-item';
import { LowScoreItem } from './items/low-score-item';
import { MissedClassItem } from './items/missed-class-item';
import { UnansweredThreadItem } from './items/unanswered-thread-item';

interface OpsQueueResultsProps {
  queue: OpsQueueResponse;
  loading: boolean;
  onUseForNote: (profileId: string) => void;
}

export function OpsQueueResults({ queue, loading, onUseForNote }: OpsQueueResultsProps) {
  const { t, language } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <QueueCard
        title={t('opsQueue.overdueGrading')}
        description={t('opsQueue.overdueGradingDescription')}
        icon={<Clock3 className="h-4 w-4" />}
        count={queue.overdue_grading.length}
        empty={t('opsQueue.empty')}
      >
        {queue.overdue_grading.map((item) => (
          <OverdueGradingItem
            key={String(item.id)}
            item={item}
            language={language}
            onUseForNote={onUseForNote}
          />
        ))}
      </QueueCard>

      <QueueCard
        title={t('opsQueue.inactivity')}
        description={t('opsQueue.inactivityDescription')}
        icon={<AlertTriangle className="h-4 w-4" />}
        count={queue.inactivity.length}
        empty={t('opsQueue.empty')}
      >
        {queue.inactivity.map((item) => (
          <InactivityItem
            key={item.id}
            item={item}
            language={language}
            onUseForNote={onUseForNote}
          />
        ))}
      </QueueCard>

      <QueueCard
        title={t('opsQueue.lowScores')}
        description={t('opsQueue.lowScoresDescription')}
        icon={<GraduationCap className="h-4 w-4" />}
        count={queue.low_scores.length}
        empty={t('opsQueue.empty')}
      >
        {queue.low_scores.map((item) => (
          <LowScoreItem key={String(item.id)} item={item} onUseForNote={onUseForNote} />
        ))}
      </QueueCard>

      <QueueCard
        title={t('opsQueue.missedClasses')}
        description={t('opsQueue.missedClassesDescription')}
        icon={<UserX className="h-4 w-4" />}
        count={queue.missed_classes.length}
        empty={t('opsQueue.empty')}
      >
        {queue.missed_classes.map((item) => (
          <MissedClassItem
            key={item.id}
            item={item}
            language={language}
            onUseForNote={onUseForNote}
          />
        ))}
      </QueueCard>

      <QueueCard
        title={t('opsQueue.unansweredThreads')}
        description={t('opsQueue.unansweredThreadsDescription')}
        icon={<MessageCircle className="h-4 w-4" />}
        count={queue.unanswered_threads.length}
        empty={t('opsQueue.empty')}
      >
        {queue.unanswered_threads.map((item) => (
          <UnansweredThreadItem
            key={item.id}
            item={item}
            language={language}
            onUseForNote={onUseForNote}
          />
        ))}
      </QueueCard>
    </div>
  );
}
