'use client';

import { useEffect, useRef } from 'react';

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

/**
 * The watermark sits in the bottom-right corner, clear of the control bar.
 * `right`, not `end`: this is placed over the video picture, which does not
 * mirror in an RTL page the way the interface around it does.
 */
const WATERMARK_POSITION = 'bottom-16 right-6';

/**
 * The one video player for protected content.
 *
 * It never puts a real file URL in `src`: hls.js feeds the element through a
 * MediaSource, so "copy video address" yields a useless `blob:`. The segments it
 * fetches are AES-128 encrypted and the key is a two-minute ticket bound to this
 * viewer, so a copied playlist is dead outside this browser.
 *
 * None of that stops a screen recorder — nothing in a browser does. The
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
  className,
}: SecureVideoPlayerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { session, status } = useSecurePlayback(videoId, videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || initialPosition <= 0 || status !== 'ready') return;
    const resume = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        video.currentTime = initialPosition;
        return;
      }
      video.currentTime = Math.min(initialPosition, Math.max(0, video.duration - 1));
    };
    if (video.readyState >= 1) {
      resume();
    } else {
      video.addEventListener('loadedmetadata', resume, { once: true });
    }
    return () => video.removeEventListener('loadedmetadata', resume);
  }, [initialPosition, status]);

  if (status === 'error') {
    // Same footprint as the player it replaces, so a failure never resizes the
    // slot it sits in.
    return (
      <div
        className={`grid place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground ${
          fill ? 'h-full w-full' : 'aspect-video w-full'
        } ${className ?? ''}`}
      >
        {t('media.videoPlaybackFailed')}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-l bg-black ${className ?? ''}`}>
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
        className={fill ? 'h-full w-full object-contain' : 'aspect-video w-full'}
      />

      {session?.watermark ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute select-none rounded-md bg-black/25 px-2 py-1 text-[11px] font-medium text-white/60 ${WATERMARK_POSITION}`}
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
