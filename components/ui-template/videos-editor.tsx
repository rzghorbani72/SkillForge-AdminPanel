'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { SectionItemControls, moveItem } from './section-item-controls';

export interface VideoItemConfig {
  videoId?: string;
  /** Relative stream path — edusphere resolves it against the API origin. */
  url?: string;
  poster?: string;
  title?: string;
  description?: string;
}

interface LibraryVideo {
  id: string;
  title: string;
  streaming_url?: string;
  poster_url?: string | null;
}

interface VideosEditorProps {
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}

function readVideos(cfg: Record<string, unknown>): VideoItemConfig[] {
  return Array.isArray(cfg.videos) ? (cfg.videos as VideoItemConfig[]) : [];
}

/**
 * Picks videos for the home-page video section out of the academy's own media
 * library. Uploading happens in the Content area, so this panel never carries a
 * second upload path that could bypass the plan's storage quota checks.
 */
export function VideosEditor({ cfg, set }: VideosEditorProps) {
  const { t } = useTranslation();
  const [library, setLibrary] = useState<LibraryVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const videos = readVideos(cfg);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getVideos()
      .then((data: unknown) => {
        if (cancelled) return;
        setLibrary(Array.isArray(data) ? (data as LibraryVideo[]) : []);
      })
      .catch((error) => {
        if (!cancelled) ErrorHandler.handleApiError(error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const write = (next: VideoItemConfig[]) => set('videos', next);

  const patch = (index: number, changes: Partial<VideoItemConfig>) =>
    write(
      videos.map((video, i) => (i === index ? { ...video, ...changes } : video))
    );

  const addVideo = (videoId: string) => {
    const source = library.find((item) => item.id === videoId);
    if (!source) return;
    write([
      ...videos,
      {
        videoId: source.id,
        url: source.streaming_url ?? `/videos/stream/${source.id}`,
        poster: source.poster_url ?? undefined,
        title: source.title
      }
    ]);
  };

  const available = library.filter(
    (item) => !videos.some((video) => video.videoId === item.id)
  );

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {t('sitePreview.videosEditorTitle')}
      </span>
      <p className="text-[11px] leading-relaxed text-zinc-500">
        {t('sitePreview.videosCaption')}
      </p>

      {videos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 py-4 text-center text-[11px] text-zinc-500">
          {t('sitePreview.videosEmpty')}
        </p>
      ) : (
        videos.map((video, index) => (
          <div
            key={video.videoId ?? index}
            className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-zinc-700">
                {video.title || `${index + 1}`}
              </span>
              <SectionItemControls
                index={index}
                count={videos.length}
                onMove={(i, dir) => write(moveItem(videos, i, dir))}
                onRemove={(i) => write(videos.filter((_, j) => j !== i))}
              />
            </div>
            <Input
              value={video.title ?? ''}
              onChange={(event) => patch(index, { title: event.target.value })}
              placeholder={t('sitePreview.videoCustomTitle')}
              className="h-8 border-zinc-300 bg-white text-xs"
            />
            <Input
              value={video.description ?? ''}
              onChange={(event) =>
                patch(index, { description: event.target.value })
              }
              placeholder={t('sitePreview.videoCustomDescription')}
              className="h-8 border-zinc-300 bg-white text-xs"
            />
          </div>
        ))
      )}

      {!isLoading && available.length === 0 ? (
        <p className="text-[11px] text-zinc-500">
          {t('sitePreview.videosLibraryEmpty')}
        </p>
      ) : (
        <Select value="" onValueChange={addVideo} disabled={isLoading}>
          <SelectTrigger className="h-8 border-zinc-300 bg-white text-xs">
            <SelectValue placeholder={t('sitePreview.videosAdd')} />
          </SelectTrigger>
          <SelectContent>
            {available.map((item) => (
              <SelectItem key={item.id} value={item.id} className="text-xs">
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
