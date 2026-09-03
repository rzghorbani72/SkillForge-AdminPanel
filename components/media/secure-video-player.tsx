'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/lib/i18n/hooks';
import { useSecurePlayback } from './use-secure-playback';

interface SecureVideoPlayerProps {
  videoId: string;
  title: string;
  /** Seconds to resume from, 0 for the start. */
  initialPosition?: number;
  onHeartbeat?: (position: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  /** Fill the parent box instead of holding a 16:9 ratio of its own. */
  fill?: boolean;
  className?: string;
}

/** How often the watermark jumps, so it cannot be cropped or masked out. */
const WATERMARK_MOVE_MS = 20_000;
const WATERMARK_POSITIONS = [
  'top-6 start-6',
  'top-6 end-6',
  'bottom-16 start-6',
  'bottom-16 end-6'
] as const;

/**
 * The one video player for protected content.
 *
 * It never puts a real file URL in `src`: hls.js feeds the element through a
 * MediaSource, so "copy video address" yields a useless `blob:`. The segments it
 * fetches are AES-128 encrypted and the key is a two-minute ticket bound to this
 * viewer, so a copied playlist is dead outside this browser.
 *
 * None of that stops a screen recorder — nothing in a browser does. The moving
 * watermark is the answer to that: a leaked recording names the account it came
 * from. See ./README.md.
 */
export function SecureVideoPlayer({
  videoId,
  title,
  initialPosition = 0,
  onHeartbeat,
  onEnded,
  autoPlay = false,
  fill = false,
  className
}: SecureVideoPlayerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { session, status } = useSecurePlayback(videoId, videoRef);
  const [markSlot, setMarkSlot] = useState(0);

  useEffect(() => {
    if (!session?.watermark) return;
    const timer = setInterval(
      () => setMarkSlot((slot) => (slot + 1) % WATERMARK_POSITIONS.length),
      WATERMARK_MOVE_MS
    );
    return () => clearInterval(timer);
  }, [session?.watermark]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || initialPosition <= 0 || status !== 'ready') return;
    const resume = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        video.currentTime = initialPosition;
        return;
      }
      video.currentTime = Math.min(
        initialPosition,
        Math.max(0, video.duration - 1)
      );
    };
    if (video.readyState >= 1) {
      resume();
    } else {
      video.addEventListener('loadedmetadata', resume, { once: true });
    }
    return () => video.removeEventListener('loadedmetadata', resume);
  }, [initialPosition, status]);

  if (status === 'error') {
    return (
      <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        {t('media.videoPlaybackFailed')}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-black ${className ?? ''}`}
    >
      <video
        ref={videoRef}
        controls
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        onContextMenu={(event) => event.preventDefault()}
        playsInline
        preload="metadata"
        poster={session?.poster ?? undefined}
        aria-label={title}
        autoPlay={autoPlay}
        onEnded={onEnded}
        onTimeUpdate={(event) => {
          if (event.currentTarget.paused) return;
          onHeartbeat?.(event.currentTarget.currentTime);
        }}
        className={
          fill ? 'h-full w-full object-contain' : 'aspect-video w-full'
        }
      />

      {session?.watermark ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute select-none rounded-md bg-black/25 px-2 py-1 text-[11px] font-medium text-white/60 transition-all duration-700 ${WATERMARK_POSITIONS[markSlot]}`}
        >
          {session.watermark}
        </span>
      ) : null}

      {status === 'loading' ? (
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-white/70">
          {t('media.videoLoading')}
        </span>
      ) : null}
    </div>
  );
}
