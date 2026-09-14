'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Video, Film } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { UploadMediaDialog } from '@/components/content/upload-media-dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { VideoStats } from '@/components/videos/VideoStats';
import { VideoGrid } from '@/components/videos/VideoGrid';
import type { VideoItem } from '@/components/videos/video-types';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useStore } from '@/hooks/useStore';

const FILTER_OPTIONS = [
  { value: 'all', labelKey: 'media.allVideos' },
  { value: 'attached', labelKey: 'media.attachedToLessons' },
  { value: 'standalone', labelKey: 'media.standaloneVideos' },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]['value'];

const isAttached = (video: VideoItem) => (video.Lesson?.length ?? 0) > 0;

export default function VideosPage() {
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');

  const fetchData = useCallback(async () => {
    if (!selectedAcademy) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getVideos();
      const list: VideoItem[] = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setVideos(list);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademy]);

  useEffect(() => {
    if (selectedAcademy) fetchData();
  }, [selectedAcademy, fetchData]);

  const visibleVideos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return videos.filter((video) => {
      const matchesSearch =
        !term ||
        video.title.toLowerCase().includes(term) ||
        (video.description ?? '').toLowerCase().includes(term);
      const matchesFilter =
        filter === 'all' || (filter === 'attached' ? isAttached(video) : !isAttached(video));
      return matchesSearch && matchesFilter;
    });
  }, [videos, searchTerm, filter]);

  const totals = useMemo(
    () =>
      videos.reduce(
        (acc, video) => ({
          attached: acc.attached + (isAttached(video) ? 1 : 0),
          size: acc.size + (video.size ?? 0),
          duration: acc.duration + (video.duration ?? 0),
        }),
        { attached: 0, size: 0, duration: 0 },
      ),
    [videos],
  );

  if (!selectedAcademy) {
    return (
      <div className="page-wrapper flex-1 p-4 sm:p-6">
        <EmptyState
          icon={<Video className="h-10 w-10" />}
          title={t('media.noStoreSelected')}
          description={t('media.selectStoreToView')}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message={t('media.loadingVideos')} />;
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-4 sm:p-6">
      <PageHeader
        icon={<Film className="h-5 w-5" />}
        title={t('media.videoManagement')}
        description={t('media.manageVideos')}
        badge={`${formatNumber(videos.length)} ${t('media.videos')}`}
      >
        <UploadMediaDialog kind="video" onUploaded={fetchData} />
      </PageHeader>

      <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
        <VideoStats
          totalVideos={videos.length}
          attachedToLessons={totals.attached}
          totalSizeBytes={totals.size}
          totalDurationSeconds={totals.duration}
        />
      </div>

      <div
        className="fade-in-up flex flex-col gap-3 sm:flex-row sm:items-center"
        style={{ animationDelay: '0.15s' }}
      >
        <SearchBar
          placeholder={t('media.searchVideos')}
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full max-w-none flex-1"
        />
        <Select value={filter} onValueChange={(value) => setFilter(value as FilterValue)}>
          <SelectTrigger className="h-10 w-full rounded-xl border-border/50 bg-background/50 sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
        <VideoGrid
          videos={visibleVideos}
          hasSearch={searchTerm.trim().length > 0 || filter !== 'all'}
        />
      </div>
    </div>
  );
}
