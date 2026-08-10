'use client';

import { useEffect, useRef } from 'react';
import { Play, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleForLanguage } from '@/lib/i18n/config';
import { formatDuration, formatFileSize } from '@/components/shared/utils';
import type { VideoItem } from './video-types';

const DEFAULT_POSTER = '/images/video-placeholder.svg';

const resolvePosterUrl = (posterUrl?: string | null): string => {
  if (!posterUrl) return DEFAULT_POSTER;
  if (posterUrl.startsWith('http')) return posterUrl;
  return `${getBrowserApiBaseUrl()}${posterUrl}`;
};

interface VideoCardProps {
  video: VideoItem;
  isActive: boolean;
  onToggle: () => void;
  onDeactivate: () => void;
}

export function VideoCard({
  video,
  isActive,
  onToggle,
  onDeactivate
}: VideoCardProps) {
  const { t, language } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    if (isActive) {
      void element.play().catch(() => {
        // Autoplay may be blocked by the browser; ignore silently.
      });
    } else {
      element.pause();
      element.currentTime = 0;
    }
  }, [isActive]);

  const posterUrl = resolvePosterUrl(video.poster_url);
  const ownerName = video.Profile?.display_name ?? t('media.unknownCreator');
  const ownerInitials = ownerName.trim().slice(0, 2).toUpperCase();
  const publishedDate = video.created_at ? new Date(video.created_at) : null;
  const hasPublishedDate =
    !!publishedDate && !Number.isNaN(publishedDate.getTime());

  const duration = formatDuration(video.duration ?? undefined);
  const fileSize = formatFileSize(video.size ?? undefined);
  const lessonTitle = video.Lesson?.[0]?.title;
  const canPlay = Boolean(video.streaming_url);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {isActive && canPlay ? (
          <video
            ref={videoRef}
            className="h-full w-full bg-black object-contain"
            poster={posterUrl}
            controls
            autoPlay
            onEnded={onDeactivate}
          >
            <source
              src={getBrowserApiBaseUrl() + video.streaming_url}
              type={video.mime_type ?? 'video/mp4'}
            />
            {t('media.browserNoVideoSupport')}
          </video>
        ) : (
          <>
            <img
              src={posterUrl}
              alt={t('media.videoThumbnail')}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <button
              type="button"
              onClick={canPlay ? onToggle : undefined}
              disabled={!canPlay}
              className={cn(
                'absolute inset-0 flex items-center justify-center text-white transition',
                canPlay ? 'hover:bg-black/20' : 'cursor-not-allowed opacity-70'
              )}
              aria-label={
                canPlay
                  ? t('media.playVideo')
                  : t('media.videoSourceUnavailable')
              }
            >
              {canPlay ? (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 shadow-lg transition group-hover:bg-primary">
                  <Play className="h-6 w-6 translate-x-px" />
                </span>
              ) : (
                <span className="rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold">
                  {t('media.unavailable')}
                </span>
              )}
            </button>

            {(duration || fileSize) && (
              <div className="pointer-events-none absolute bottom-3 end-3 flex items-center gap-2 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
                {duration && <span>{duration}</span>}
                {duration && fileSize && (
                  <span className="h-1 w-1 rounded-full bg-white/70" />
                )}
                {fileSize && <span>{fileSize}</span>}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3 p-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback>{ownerInitials}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground transition group-hover:text-primary">
            {video.title || t('media.untitledVideo')}
          </h3>
          <p className="text-sm text-muted-foreground">{ownerName}</p>
          {hasPublishedDate && publishedDate && (
            <span className="text-xs text-muted-foreground/80">
              {publishedDate.toLocaleDateString(
                getLocaleForLanguage(language),
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }
              )}
            </span>
          )}
          {video.description && (
            <p className="line-clamp-2 pt-1 text-sm text-muted-foreground">
              {video.description}
            </p>
          )}
          {lessonTitle && (
            <Badge
              variant="secondary"
              className="mt-2 w-fit gap-1 rounded-full text-[11px] font-medium"
            >
              <BookOpen className="h-3 w-3" />
              {lessonTitle}
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
}
