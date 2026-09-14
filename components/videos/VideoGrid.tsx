'use client';

import { useState } from 'react';
import { Video } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTranslation } from '@/lib/i18n/hooks';
import { VideoCard } from './VideoCard';
import type { VideoItem } from './video-types';

interface VideoGridProps {
  videos: VideoItem[];
  hasSearch?: boolean;
}

export function VideoGrid({ videos, hasSearch = false }: VideoGridProps) {
  const { t } = useTranslation();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={<Video className="h-10 w-10" />}
        title={t('media.noVideosFound')}
        description={hasSearch ? t('media.noVideosMatch') : t('media.uploadFirstVideo')}
      />
    );
  }

  return (
    <div className="stagger-children grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          isActive={activeVideoId === video.id}
          onToggle={() => setActiveVideoId((current) => (current === video.id ? null : video.id))}
          onDeactivate={() => setActiveVideoId(null)}
        />
      ))}
    </div>
  );
}
