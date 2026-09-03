'use client';

import { useEffect, useRef, useState } from 'react';

import { call } from '@/lib/api-call';
import { logger } from '@/lib/logging/app-logger';

/**
 * Opens a watch session for one video and keeps an hls.js instance attached to
 * the given <video> element.
 *
 * hls.js is loaded lazily so the ~150 KB parser only reaches browsers that
 * actually play something, and never blocks a page that merely shows a poster.
 */

export type PlaybackTier = 'encrypted' | 'public' | 'legacy';

export interface PlaybackSession {
  tier: PlaybackTier;
  playlistUrl: string;
  poster: string | null;
  watermark: string | null;
  sessionId: string | null;
  expiresAt: string | null;
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

export function useSecurePlayback(
  videoId: string | null | undefined,
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const [session, setSession] = useState<PlaybackSession | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const destroyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!videoId) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const next = await call<PlaybackSession>(
          `/videos/hls/session/${videoId}`,
          { method: 'POST' }
        );
        if (cancelled) return;
        setSession(next);
        await attach(next);
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        logger.error('Media', 'PlaybackSessionFailed', {
          video_id: videoId,
          error_name: error instanceof Error ? error.name : 'unknown'
        });
      }
    })();

    async function attach(next: PlaybackSession) {
      const element = videoRef.current;
      if (!element) return;

      // Not converted yet: play the original route rather than show a dead player.
      if (next.tier === 'legacy') {
        element.src = next.playlistUrl;
        setStatus('ready');
        return;
      }

      // iOS Safari has no Media Source Extensions, so hls.js cannot run there.
      // Native HLS works because every ticket travels in the URL, not a header.
      const { default: Hls } = await import('hls.js');
      if (!Hls.isSupported()) {
        if (element.canPlayType('application/vnd.apple.mpegurl')) {
          element.src = next.playlistUrl;
          setStatus('ready');
          return;
        }
        setStatus('error');
        return;
      }

      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(next.playlistUrl);
      hls.attachMedia(element);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus('ready'));
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        setStatus('error');
        logger.error('Media', 'PlayerError', {
          video_id: videoId ?? 'unknown',
          error_type: data.type,
          error_details: data.details
        });
      });

      destroyRef.current = () => hls.destroy();
    }

    return () => {
      cancelled = true;
      destroyRef.current?.();
      destroyRef.current = null;
    };
  }, [videoId, videoRef]);

  return { session, status };
}
