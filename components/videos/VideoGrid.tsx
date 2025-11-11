'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

const DEFAULT_POSTER = '/images/video-placeholder.svg';

interface VideoGridProps {
  videos: any[];
  onVideoSelect?: (video: any) => void;
  getVideoIcon: (type?: string) => React.ReactNode;
  getVideoTypeColor: (type?: string) => string;
  formatDuration: (seconds?: number) => string;
  formatFileSize: (bytes?: number) => string;
  getPosterUrl: (posterUrl: string | null | undefined) => string | null;
  isOwnMedia: (video: any) => boolean;
}

export function VideoGrid({
  videos,
  onVideoSelect,
  getVideoIcon,
  getVideoTypeColor,
  formatDuration,
  formatFileSize,
  getPosterUrl,
  isOwnMedia
}: VideoGridProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | number | null>(
    null
  );

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={<Video className="h-12 w-12" />}
        title="No videos found"
        description="Upload your first video to get started."
      />
    );
  }

  return (
    <div className="grid justify-center gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] sm:[grid-template-columns:repeat(auto-fit,minmax(340px,1fr))] lg:[grid-template-columns:repeat(auto-fit,minmax(450px,1fr))]">
      {videos.map((video) => {
        const isActive = activeVideoId === video.id;

        return (
          <VideoCard
            key={video.id}
            video={video}
            isActive={isActive}
            onToggle={() => {
              if (isActive) {
                setActiveVideoId(null);
              } else {
                setActiveVideoId(video.id);
                onVideoSelect?.(video);
              }
            }}
            onDeactivate={() => setActiveVideoId(null)}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
          />
        );
      })}
    </div>
  );
}

interface VideoCardProps {
  video: any;
  isActive: boolean;
  onToggle: () => void;
  onDeactivate: () => void;
  getVideoIcon: (type?: string) => React.ReactNode;
  getVideoTypeColor: (type?: string) => string;
  formatDuration: (seconds?: number) => string;
  formatFileSize: (bytes?: number) => string;
  getPosterUrl: (posterUrl: string | null | undefined) => string | null;
  isOwnMedia: (video: any) => boolean;
}

function VideoCard({
  video,
  isActive,
  onToggle,
  onDeactivate,
  getVideoIcon,
  getVideoTypeColor,
  formatDuration,
  formatFileSize,
  getPosterUrl,
  isOwnMedia
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    if (isActive) {
      const playPromise = element.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // Autoplay might be blocked; ignore silently.
        });
      }
    } else {
      element.pause();
      element.currentTime = 0;
    }
  }, [isActive]);

  const rawPosterSource =
    video.posterUrl ??
    video.poster_url ??
    video.thumbnailUrl ??
    video.thumbnail_url ??
    video.metadata?.thumbnail_url;
  const posterUrl =
    getPosterUrl(rawPosterSource) ??
    (rawPosterSource && typeof rawPosterSource === 'string'
      ? rawPosterSource
      : DEFAULT_POSTER);
  const videoTypeLabel = video.type ?? 'Video';
  const typeBadgeClass = getVideoTypeColor(video.type);
  const isOwner = isOwnMedia(video);

  const ownerName =
    video.Owner?.name ??
    video.owner?.name ??
    video.uploader?.name ??
    'Unknown creator';

  const ownerAvatar =
    video.Owner?.avatar_url ??
    video.owner?.avatar_url ??
    video.uploader?.avatar_url ??
    video.Owner?.avatar?.url ??
    video.owner?.avatar?.url ??
    video.uploader?.avatar?.url;

  const ownerInitials = ownerName
    .split(' ')
    .map((part: string) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const publishedAt =
    video.created_at ||
    video.metadata?.created_at ||
    video.uploadedAt ||
    video.published_at;
  const publishedDate =
    publishedAt && typeof publishedAt === 'string'
      ? new Date(publishedAt)
      : null;
  const hasPublishedDate =
    !!publishedDate && !Number.isNaN(publishedDate.getTime());

  const durationSeconds =
    video.durationSeconds ?? video.duration ?? video.metadata?.duration;
  const duration = formatDuration(durationSeconds);
  const fileSizeBytes =
    video.fileSizeBytes ?? video.size ?? video.metadata?.size_bytes;
  const fileSize = formatFileSize(fileSizeBytes);

  const videoSource =
    video.streaming_url ||
    video.stream_url ||
    video.url ||
    video.source_url ||
    video.media_url ||
    video.media?.url ||
    video.metadata?.streaming_url;
  const videoMimeType =
    video.mime_type ||
    video.media?.mime_type ||
    video.metadata?.mime_type ||
    'video/mp4';
  const canPlay = Boolean(videoSource);

  const handlePlayClick = () => {
    if (!canPlay) return;
    onToggle();
  };

  return (
    <div className="group mx-auto flex w-full max-w-[800px] flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary hover:-translate-y-1 hover:shadow-lg lg:min-w-[450px]">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {isActive && canPlay ? (
          <video
            ref={videoRef}
            className="h-full w-full bg-black object-cover"
            poster={posterUrl ?? DEFAULT_POSTER}
            controls
            autoPlay
            onEnded={onDeactivate}
          >
            <source
              src={process.env.NEXT_PUBLIC_API_URL + videoSource}
              type={videoMimeType}
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <>
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={video.title ?? 'Video thumbnail'}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/30">
                <span className="text-muted-foreground/70">
                  {getVideoIcon(video.type)}
                </span>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 transition group-hover:opacity-80" />

            <button
              type="button"
              onClick={handlePlayClick}
              className={cn(
                'absolute inset-0 flex items-center justify-center bg-black/0 text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                canPlay ? 'hover:bg-black/20' : 'cursor-not-allowed opacity-70'
              )}
              aria-label={
                canPlay
                  ? `Play ${video.title ?? 'video'}`
                  : 'Video source unavailable'
              }
            >
              {canPlay ? (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition group-hover:bg-black/70">
                  <Play className="h-6 w-6 translate-x-px" />
                </span>
              ) : (
                <span className="rounded-full bg-black/70 px-4 py-2 text-sm font-semibold uppercase tracking-wide">
                  Unavailable
                </span>
              )}
            </button>
          </>
        )}

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-inset ring-black/10 backdrop-blur',
              typeBadgeClass
            )}
          >
            <span className="text-sm leading-none">
              {getVideoIcon(video.type)}
            </span>
            <span className="font-semibold uppercase tracking-wide">
              {videoTypeLabel}
            </span>
          </span>
          {isOwner && (
            <span className="rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm ring-1 ring-white/10">
              Your upload
            </span>
          )}
        </div>

        {!isActive && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between text-xs font-medium text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1">
              <Play className="h-3 w-3" />
              <span className="uppercase tracking-wide">Watch</span>
            </span>
            <div className="flex items-center gap-2">
              {duration && <span>{duration}</span>}
              {duration && fileSize && fileSize !== 'Unknown' && (
                <span className="h-1 w-1 rounded-full bg-white/70" />
              )}
              {fileSize && fileSize !== 'Unknown' && <span>{fileSize}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 p-4">
        <Avatar className="h-12 w-12">
          {ownerAvatar ? (
            <AvatarImage src={ownerAvatar} alt={ownerName} />
          ) : (
            <AvatarFallback>{ownerInitials || 'SF'}</AvatarFallback>
          )}
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground transition group-hover:text-primary">
            {video.title ?? 'Untitled video'}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {ownerName}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground/80">
            {hasPublishedDate && publishedDate && (
              <span>
                {publishedDate.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            )}
            {duration && duration !== 'Unknown' && (
              <span className="flex items-center gap-1">
                <Play className="h-3 w-3" />
                {duration}
              </span>
            )}
            {fileSize && fileSize !== 'Unknown' && <span>{fileSize}</span>}
          </div>
        </div>
      </div>

      {video.description && (
        <div className="px-4 pb-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {video.description}
          </p>
        </div>
      )}
    </div>
  );
}
