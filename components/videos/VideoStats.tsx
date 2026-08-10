'use client';

import { Video, BookOpen, HardDrive, Clock } from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { formatFileSize } from '@/components/shared/utils';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

interface VideoStatsProps {
  totalVideos: number;
  attachedToLessons: number;
  totalSizeBytes: number;
  totalDurationSeconds: number;
}

export function VideoStats({
  totalVideos,
  attachedToLessons,
  totalSizeBytes,
  totalDurationSeconds
}: VideoStatsProps) {
  const { t } = useTranslation();

  const hours = Math.floor(totalDurationSeconds / 3600);
  const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const durationLabel = hours
    ? `${formatNumber(hours)} ${t('media.hoursShort')}`
    : `${formatNumber(minutes)} ${t('media.minutesShort')}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        icon={Video}
        title={t('media.totalVideos')}
        value={formatNumber(totalVideos)}
        description={t('media.allVideoContent')}
      />
      <StatsCard
        icon={BookOpen}
        title={t('media.attachedToLessons')}
        value={formatNumber(attachedToLessons)}
        description={t('media.courseContentVideos')}
        iconColor="text-emerald-600"
      />
      <StatsCard
        icon={Clock}
        title={t('media.totalDuration')}
        value={durationLabel}
        description={t('media.combinedVideoLength')}
        iconColor="text-sky-600"
      />
      <StatsCard
        icon={HardDrive}
        title={t('media.totalSize')}
        value={formatFileSize(totalSizeBytes)}
        description={t('media.storageUsedByVideos')}
        iconColor="text-amber-600"
      />
    </div>
  );
}
